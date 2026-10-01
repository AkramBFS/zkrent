import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Stripe webhook secret is unconfigured on server' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown signature error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const applicationId = session.metadata?.applicationId;
        const paymentIntentId = session.payment_intent ? String(session.payment_intent) : null;

        if (!applicationId) {
          console.warn('[Stripe Webhook] checkout.session.completed without applicationId metadata', session.id);
          break;
        }

        // 1. Idempotency check: see if payment is already marked PAID
        const existingPayment = await prisma.payment.findFirst({
          where: {
            OR: [
              { stripeSessionId: session.id },
              { applicationId: applicationId },
            ],
          },
        });

        if (existingPayment?.status === 'PAID') {
          console.log(`[Stripe Webhook] Payment ${existingPayment.id} already marked PAID. Idempotent skip.`);
          return NextResponse.json({ received: true, alreadyProcessed: true });
        }

        // 2. Update Payment record
        if (existingPayment) {
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: 'PAID',
              stripePaymentIntentId: paymentIntentId ?? existingPayment.stripePaymentIntentId,
              transactionId: session.id,
            },
          });
        } else {
          // Fallback if session wasn't tracked beforehand
          await prisma.payment.create({
            data: {
              applicationId,
              userId: session.metadata?.userId || (await prisma.application.findUnique({ where: { id: applicationId } }))?.tenantId || '',
              amount: (session.amount_total || 500) / 100,
              currency: session.currency?.toUpperCase() || 'USD',
              status: 'PAID',
              stripeSessionId: session.id,
              stripePaymentIntentId: paymentIntentId,
              transactionId: session.id,
            },
          });
        }

        // 3. Event-ordering safety on Application status
        const app = await prisma.application.findUnique({
          where: { id: applicationId },
          select: { status: true },
        });

        if (app) {
          // Only transition to PAYMENT_CONFIRMED if application was in PENDING_PAYMENT
          // Do NOT downgrade an application if it was already VERIFYING or ZK_VERIFIED
          const newStatus = app.status === 'PENDING_PAYMENT' ? 'PAYMENT_CONFIRMED' : app.status;

          await prisma.application.update({
            where: { id: applicationId },
            data: {
              paymentStatus: 'PAID',
              status: newStatus,
            },
          });
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const applicationId = session.metadata?.applicationId;

        console.log(`[Stripe Webhook] checkout.session.expired for session ${session.id}`);

        await prisma.payment.updateMany({
          where: { stripeSessionId: session.id, status: 'PENDING' },
          data: { status: 'FAILED' },
        });

        if (applicationId) {
          const app = await prisma.application.findUnique({
            where: { id: applicationId },
            select: { paymentStatus: true },
          });

          if (app && app.paymentStatus !== 'PAID') {
            await prisma.application.update({
              where: { id: applicationId },
              data: { paymentStatus: 'FAILED' },
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentIntentId = paymentIntent.id;

        console.log(`[Stripe Webhook] payment_intent.payment_failed for ${paymentIntentId}`);

        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: paymentIntentId },
        });

        if (payment && payment.status !== 'PAID') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          });

          await prisma.application.update({
            where: { id: payment.applicationId },
            data: { paymentStatus: 'FAILED' },
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;

        console.log(`[Stripe Webhook] charge.refunded for payment intent ${paymentIntentId}`);

        if (paymentIntentId) {
          const payment = await prisma.payment.findFirst({
            where: { stripePaymentIntentId: paymentIntentId },
          });

          if (payment) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'REFUNDED' },
            });

            await prisma.application.update({
              where: { id: payment.applicationId },
              data: {
                paymentStatus: 'REFUNDED',
                status: 'WITHDRAWN',
              },
            });
          }
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, eventType: event.type, processed: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error processing webhook';
    console.error('[Stripe Webhook] Processing error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
