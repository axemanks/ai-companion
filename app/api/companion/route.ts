// api/companion/route.ts endpoint
// this will create a new companion and save to prisma

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// POST - to create a new companion
export async function POST(req: Request) {
    try {
        const body = await req.json(); // get body
        const user = await currentUser(); // get user from clerk
        const { src, name, description, instructions, seed, categoryId } = body; // get body data
        // Check for user, user.id
        // Removed !user.firstName from If statement
        if(!user || !user.id) {
            return new NextResponse("Unauthorized", {status: 401})
        }
        // Clerk may not return a first name as it's not required, so we need to create a name for them
        // we can slice the email address at the @ symbol and use that as a name
        if (!user.firstName) {
        let firstName = user.emailAddresses[0].emailAddress.split('@')[0]; // get first email address and split at @ symbol
        user.firstName = firstName; // set as the fistname
        }


        // check if data missing from fields
        if (!src || !name || !description || !instructions || !seed || !categoryId) {
            return new NextResponse("Missing Required Fields", { status: 400 })
        }
        //  check for subscription
        const isPro = await checkSubscription();
        // if not pro, return error
        if (!isPro) {
            return new NextResponse("Pro Subscription Required", { status: 403 })
        }



        const companion = await prismadb.companion.create({
            data: {
            categoryId,
            userId: user.id,
            userName: user.firstName,
            src,
            name,
            description,
            instructions,
            seed,
        }
        });

        return NextResponse.json(companion);
        
    } catch (error) {
        console.log(error, "[COMPANION_POST]");
        return new NextResponse("Internal Error", { status: 500 })
    }
}