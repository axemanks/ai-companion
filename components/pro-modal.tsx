"use client"
import { useState } from "react";
import { useProModal } from "@/hooks/use-pro-modal"; // hook to open and close
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import axios from "axios";


export const ProModal = () => {
    const proModal = useProModal();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Subscribe
    const onSubscribe = async ()  => {
        try {
            setLoading(true);
            
            const response = await axios.get("/api/stripe");
            console.log("subscribe response",response.data.url);

            window.location.href = response.data.url;


        } catch (error) {
            toast({
                variant: "destructive",
                description: "Something went wrong trying to subscribe."
            })
            
        } finally {
            setLoading(false);
        }
    }
    return (
        <Dialog
        // add hooks- from zustand modal store
        open={proModal.isOpen} // open
        onOpenChange={proModal.onClose} // close
        >
            <DialogContent>
                <DialogHeader className="space-y-4">
                    <DialogTitle className="text-center">
                        Upgrade to Pro
                    </DialogTitle>
                    <DialogDescription className="text-center space-y-2">
                        Create <span className="text-sky-500 mx-1 font-medium">Custom AI</span>Companions!
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="flex justify-between">
                    <p className="text-2xl font-medium">
                        $9
                        <span className="text-sm font-normal">
                            .99 / mo
                        </span>
                    </p>
                    <Button onClick={onSubscribe} variant="premium" disabled={loading}>
                        Subscribe
                    </Button>
                </div>
            </DialogContent>

        </Dialog>
    )
}