import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

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

  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { applicationId, userId } = session.metadata || {};

    if (applicationId) {
      // 1. Update Payment record
      await prisma.payment.updateMany({
        where: {
          OR: [
            { stripeSessionId: session.id },
            { applicationId: applicationId },
          ],
        },
        data: {
          status: 'PAID',
          stripePaymentIntentId: session.payment_intent ? String(session.payment_intent) : undefined,
          transactionId: session.id,
        },
      });

      // 2. Update Application record
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          paymentStatus: 'PAID',
          status: 'PAYMENT_CONFIRMED',
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}

