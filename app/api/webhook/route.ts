// webhook for stripe
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const body = await req.text();
  console.log('api/webhook endpoint hit with POST');
  // Signature from headers
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    console.log('Starting webhook verification');
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.log('Webhook error:', error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
  // get session
  const session = event.data.object as Stripe.Checkout.Session;
  // update payment details or subscribe for the first time
  // listen for checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    console.log('Retreiving subscription data for:', session.subscription);
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.metadata?.userId) {
      console.log('No userId found');
      return new NextResponse('User ID is required', { status: 400 });
    }
    // update user subscription in prisma
    console.log(
      'Creating user subscription in prisma for:',
      session?.metadata?.userId
    );
    await prismadb.userSubscription.create({
      data: {
        userId: session?.metadata?.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });
  }
  // If updated or cancelled
  if (event.type === 'invoice.payment_succeeded') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    console.log('Updating subscription');
    // update user subscription in prisma
    await prismadb.userSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });
  }
  return new NextResponse(null, { status: 200 });
}
