// Endpoint for stripe

import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

// settings url
const settingsUrl = absoluteUrl("/settings");

export async function GET() {
    try {
        // get userID from clerk
        const { userId } = auth();
        // get user
        const user = await currentUser();
        // check if user exists
        if(!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        // if not subscribed redirect to subscription page, if subscribed redirect to settings page
        // check for active sub
        const userSubscription = await prismadb.userSubscription.findUnique({
            where: {
                userId: userId,
            }
        });
        // if there is a subscription and stripe customer id
        if(userSubscription && userSubscription.stripeCustomerId){
            // create stripe session to billing portal
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userSubscription.stripeCustomerId,
                // return to settings
                return_url: settingsUrl,
            });

            return new NextResponse(JSON.stringify({ url: stripeSession.url }));
        }
        // If not subscribed, redirect to checkout session
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: settingsUrl,
            cancel_url: settingsUrl,
            payment_method_types: ["card","paypal","klarna"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user.emailAddresses[0].emailAddress, // from currentUser();
            // options for subscription
            line_items: [
                // Add each item in it's own object
                {
                    price_data: {
                        currency: "USD",
                        product_data: {
                            name: "Companion Pro",
                            description: "Create Custom AI Companions",
                        },
                        unit_amount: 999, // $9.99
                        recurring: {
                            interval: "month",
                        }
                    },
                    quantity: 1,
                }
            ],
            // stripe will call our webhook with the userId, so we know which subscription to update
            metadata: {
                userid: userId,
            }
        })
        // Return the stripe session
        return new NextResponse(JSON.stringify({ url: stripeSession.url }))

    } catch (error) {
        console.log("[STRIPE_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
