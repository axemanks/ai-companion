// zustand store for the modal
// this will control if it is open or closed

import {create} from "zustand";

interface useProModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};
// open and close the modal
export const useProModal = create<useProModalStore>((set) => ({
    isOpen: false, // default
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));

