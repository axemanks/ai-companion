// Chat messages component- will list out each message
"use client"

import { Companion } from "@prisma/client";
import { ChatMessage, ChatMessageProps } from "./chat-message";
import { ElementRef, useEffect, useRef, useState } from "react";

interface ChatMessagesProps {
    messages: ChatMessageProps[];
    isLoading: boolean;
    companion: Companion;
};

export const ChatMessages = ({
    messages,
    isLoading,
    companion
}: ChatMessagesProps) => {
    const scrollRef = useRef<ElementRef<"div">>(null);

    // fake loading trick for first message
    const [fakeLoading, setFakeLoading] = useState(messages.length === 0 ? true : false);
    useEffect(()=> {
        const timeout = setTimeout(() => {
            setFakeLoading(false);
        }, 1000);
        // clear the timeout
        return () => clearTimeout(timeout);
    }, []);

    // useEffect - to scroll to the bottom of messages using ref div
    useEffect(() => {
        scrollRef?.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages.length])

    return (
        <div className="flex-1 overflow-y-auto pr-4 ">
            {/* Load an Inital fake message */}
            <ChatMessage
            isLoading={fakeLoading}
            src={companion.src}
            role="system"
            content={`Hello, I am ${companion.name}, ${companion.description}`}
            />
            {/* Render the actual messages */}
            {messages.map((message) => (
                <ChatMessage 
                key={message.content}
                role={message.role}
                content={message.content}
                src={message.src}
                />
            ))}
            {isLoading && (
                <ChatMessage 
                role="system"
                src={companion.src}
                isLoading
                />
            )}
            {/* reference element to handle scrolling to bottom */}
            <div ref={scrollRef} />
        </div>
    )
};