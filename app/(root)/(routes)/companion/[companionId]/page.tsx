// Dynamic page for each companion

import prismadb from "@/lib/prismadb";
import { CompanionForm } from "./components/CompanionForm";
import { auth, redirectToSignIn } from "@clerk/nextjs";

interface CompanionIdPageProps {
    params: {
        companionId: string;
    };
};


const CompanionIdPage = async ({
    params
}: CompanionIdPageProps) => {
    const { userId } = auth();
    if(!userId){
        return redirectToSignIn();
    }
    // Todo Check subscription

    // fetch compaion via id
    const companion = await prismadb.companion.findUnique({
        where: {
            id: params.companionId,
            userId
        }
    });
    // fetch categories
    const categories = await prismadb.category.findMany();

    return (
        <CompanionForm  initialData={companion} categories={categories}/>
    )
};

export default CompanionIdPage;