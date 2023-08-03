// stripe subscriptions
import { auth } from "@clerk/nextjs";
import prismadb from "./prismadb";

// Day in milliseconds
const DAY_IN_MS = 86400000;

// Check if subscription is valid
export const checkSubscription = async () => {
    // get userId from clerk
    const { userId} = auth();
    // check if userId exists
    if (!userId) {
        return false;
    }
    // fetch user subscription
    const userSubscription = await prismadb.userSubscription.findUnique({
        where: {
            userId: userId,
        },
        select: {
            stripeCurrentPeriodEnd: true,
            stripeCustomerId: true,
            stripePriceId: true,
            stripeSubscriptionId: true,
        }
    });

    // if no subscription
    if (!userSubscription) {
        return false;
    }
    // if it exists, check if it is valid (not expired)
    const isValid = userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();
    // return validity
    return !!isValid;
};