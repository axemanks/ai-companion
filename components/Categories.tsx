// Categories component to display the categores at top
"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client"
import qs from 'query-string';

interface CategoriesProps {
    data: Category[];
};

// update the url when a category is selected
export const Categories = ({data}: CategoriesProps) => {
    const router = useRouter(); // define router
    const searchparams = useSearchParams(); // define search params

    const categoryId = searchparams.get("categoryId"); // get category id from search params
    // Handle click
    const onClick = (id: string | undefined) => {
        // set query to be the category clicked
        const query = { categoryId: id};
        // update url
        const url = qs.stringifyUrl({
            url: window.location.href,
            query,
        }, {skipNull: true})
        // push to url
        router.push(url);
    }

    return (
        <div className="w-full overflow-x-auto space-x-2 flex p-1">
            <button 
            onClick={() => onClick(undefined)}
            className={cn(`
            flex 
            items-center 
            text-center
            text-xs
            md:text-sm
            px-2
            md:px-4
            py-2
            md:py-3
            rounded-md
            bg-primary/10
            hover:opacity-75
            transition
            `, !categoryId ? "bg-primary/25" : "bg-primary/10")}// highlight current category
            >
                Newest
            </button>
            {data.map((item) => (
                <button 
                onClick={() => onClick(item.id)}
                key={item.id}
                className={cn(`
                flex 
                items-center 
                text-center
                text-xs
                md:text-sm
                px-2
                md:px-4
                py-2
                md:py-3
                rounded-md
                bg-primary/10
                hover:opacity-75
                transition
                `, item.id === categoryId ? "bg-primary/25" :"bg-primary/10")} // highlight current category
                >
                    {item.name}
                </button>
            ))}
        </div>
    )
}