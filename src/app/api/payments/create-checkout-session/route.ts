import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, propertyId, simulate } = await req.json().catch(() => ({}));

    if (!applicationId || !propertyId) {
      return NextResponse.json(
        { error: 'applicationId and propertyId are required' },
        { status: 400 }
      );
    }

    // Verify application exists and tenant owns it
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { property: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.tenantId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this application' }, { status: 403 });
    }

    const fee = application.property.verificationFee || 5.0;

    // Simulation / direct test payment mode (when Stripe keys are not active or requested)
    if (simulate || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      const mockTxId = `sim_tx_${Date.now()}`;
      
      const payment = await prisma.payment.create({
        data: {
          applicationId,
          userId: session.user.id,
          amount: fee,
          currency: 'USD',
          status: 'PAID',
          transactionId: mockTxId,
        },
      });

      await prisma.application.update({
        where: { id: applicationId },
        data: {
          paymentStatus: 'PAID',
          status: 'PAYMENT_CONFIRMED',
        },
      });

      return NextResponse.json({
        status: 'paid',
        paymentId: payment.id,
        transactionId: mockTxId,
        message: 'Verification fee payment confirmed',
      });
    }

    // Live Stripe Checkout Session
    const unitAmountCents = Math.round(fee * 100);
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Privacy Verification Fee',
              description: `ZK Qualification verification for ${application.property.title}`,
            },
            unit_amount: unitAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        applicationId,
        propertyId,
        userId: session.user.id,
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&appId=${applicationId}`,
      cancel_url: `${origin}/tenant/applications/${applicationId}/payment`,
    });

    // Record pending payment in PostgreSQL
    await prisma.payment.create({
      data: {
        applicationId,
        userId: session.user.id,
        amount: fee,
        currency: 'USD',
        status: 'PENDING',
        stripeSessionId: checkoutSession.id,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

