// the dynamic messages page
// has it's own layout

import prismadb from "@/lib/prismadb";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ChatClient } from "./components/Client";


// the dynamic part of the url is kept in params
interface ChatIdPageProps {
    params: {
        chatId: string
    }
};

// pass in params to get the dynamic part of the url
const ChatIdPage = async ({
    params
}: ChatIdPageProps) => {
    // get userId
    const { userId } = auth(); // from Clerk
    // check - if no id redirect to sign in
    if (!userId) {
        return redirectToSignIn(); // function from clerk
    };
    // find companion with the params.chatId
    const companion = await prismadb.companion.findUnique({
        where: {
            id: params.chatId
        },
        // include messages that match userId
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
                where: {
                    userId,
                }
            },
            // count includes ALL messages from ALL users
            _count: {
                select: {
                    messages: true
                }
            }
        }
    });

    // if no companion found - redirect home
    if (!companion) {
        return redirect("/");
    }


    return (
        <ChatClient companion={companion} />
    )
};

export default ChatIdPage;