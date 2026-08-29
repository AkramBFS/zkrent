import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId } = await params;

    // Search by payment ID or stripeSessionId
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { id: paymentId.length === 36 ? paymentId : undefined },
          { stripeSessionId: paymentId },
          { transactionId: paymentId },
        ].filter(Boolean) as any,
      },
      include: {
        application: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Check ownership
    const isTenant = payment.userId === session.user.id;
    const isLandlord = payment.application.property.landlordId === session.user.id;

    if (!isTenant && !isLandlord) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      status: 'ok',
      payment: {
        id: payment.id,
        applicationId: payment.applicationId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status.toLowerCase(),
        rawStatus: payment.status,
        stripeSessionId: payment.stripeSessionId,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ error: 'Failed to fetch payment details' }, { status: 500 });
  }
}

