// endpoint: /api/companion/[companionId]
import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: {params: { companionId: string}}
    ) {
    try {
        const body = await req.json(); // get body
        const user = await currentUser(); // get user from clerk
        const { src, name, description, instructions, seed, categoryId } = body; // get body data
        // Check for params
        if (!params.companionId){
            return new NextResponse("Companion ID is required", { status: 400 })
        }
        // Check for user, user.id, and user.firstName
        if(!user || !user.id || !user.firstName) {
            return new NextResponse("Unauthorized", {status: 401})
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


        const companion = await prismadb.companion.update({
            where: {
                id: params.companionId,
                userId: user.id,
            },
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
        console.log(error, "[COMPANION_PATCH]");
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// Delete
export async function DELETE(
    request: Request,
    { params }: {params: { companionId: string}}
) {
    try {
        // get user Id
        const { userId} = auth(); // clerk
        // Check for userId
        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }
        const companion = await prismadb.companion.delete({
            where: {
                userId,
                id: params.companionId,
            }
        });
        
        return NextResponse.json(companion);
    } catch (error) {
        console.log("[COMPANION_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}