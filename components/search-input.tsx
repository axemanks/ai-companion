"use client"
import qs from "query-string"; // The QueryString collection is used to retrieve the variable values in the HTTP query string.
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEventHandler, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";



export const SearchInput = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get the search query
    const categoryID = searchParams.get("categoryID");
    const name = searchParams.get("name");

    const [value, setValue] = useState(name || ""); // search value
    // debounce - only after waiting half a second does it search
    const debouncedValue = useDebounce<string>(value, 500);

    const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setValue(e.target.value);
    };
    // add input as it's entered
    useEffect(() => {
        // create query
        const query = {
            name: debouncedValue,
            categoryID: categoryID,
        };
        // get url
        const url = qs.stringifyUrl({
            url: window.location.href,
            query: query,
        }, {skipEmptyString: true, skipNull: true}); // remove from query if empty or null
        // push to url
        router.push(url);

    }, [debouncedValue, router, categoryID]);


    return (
        <div className="relative">
            <Search className="absolute h-4 w-4 top-3 left-4 text-muted-forground" />
            <Input
            placeholder="Search..."
            className="pl-10 bg-primary/10"
            onChange={onChange}
            value={value}
            >
            
            </Input>
        </div>
    )
};