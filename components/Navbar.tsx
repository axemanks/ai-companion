// Navbar.tsx - Navbar component
"use client"
import { Menu, Sparkles } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils"; // util to combine tailwind classes and custom classes
import { Button } from "./ui/button";
import { ModeToggle } from "./ui/mode-toggle";
import { MobileSidebar } from "./mobile-sidebar";
import { useProModal } from "@/hooks/use-pro-modal";


interface NavbarProps {
    isPro: boolean;
};


// Use Poppins
const font = Poppins({
    weight: '600',
    subsets:["latin"]
})

export const Navbar = ({
    isPro,
}: NavbarProps) => {
    const proModal = useProModal();


    return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
        <div className="flex items-center">
            {/* <Menu className="block md:hidden "/> */}
            <MobileSidebar />
        <Link href="/" >
            {/* use cn here to add poppins(font.className) after tailwinds classes */}
            <h1 className={cn("hidden md:block text-xl md:text-3xl font-bold text-primary text-sky-500", font.className)}>companion.ai</h1>
        </Link>
        </div>
        {/* User button */}
        <div className="flex items-center gap-x-3">
            {!isPro && (
            <Button size="sm" variant="premium" onClick={proModal.onOpen}>
                Upgrade
                <Sparkles className="h-4 w-4 fill-white text-white ml-2" />
            </Button>
            )}
            <ModeToggle />
            <UserButton afterSignOutUrl="/" />
        </div>
    </div>
    );
};