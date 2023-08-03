import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';

// Todo- needed to hard code the settingsURL to "http://localhost:3000/settings"
// find out why
const settingsUrl = absoluteUrl('/settings');

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();
    //console.log("user", user)
    //console.log('userId', userId)
    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    //console.log("Attempting to find subscription")
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    //console.log("User Sub:", userSubscription)
    //console.log("Stripe Customer Id:", userSubscription?.stripeCustomerId)

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }
    //console.log("No sub found, creating checkout session...")
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: 'Companion Pro',
              description: 'Create Custom AI Companions',
            },
            unit_amount: 999,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    console.log('Stripe Session:', stripeSession);
    console.log('Success URL:', stripeSession.success_url);
    console.log('Cancel URL:', stripeSession.cancel_url);

    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    console.log('[STRIPE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
