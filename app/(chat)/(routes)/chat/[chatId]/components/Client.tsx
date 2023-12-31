// chat client for the dynamic messages page
'use client';
import { useCompletion } from 'ai/react';
import { ChatHeader } from '@/components/chat-header';

import { Companion, Message } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ChatForm } from '@/components/chat-form';
import { ChatMessages } from '@/components/chat-messages';
import { ChatMessageProps } from '@/components/chat-message';
import { useToast } from '@/components/ui/use-toast';

interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}

export const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
  const {toast} = useToast();
  const [messages, setMessages] = useState<ChatMessageProps[]>(
    companion.messages
  );

  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      api: `/api/chat/${companion.id}`,
      onFinish(_prompt, completion) {
        const systemMessage: ChatMessageProps = {
          role: 'system',
          content: completion,
        };
        // add system message to messages
        setMessages((current) => [...current, systemMessage]);
        // clear input
        setInput('');
        // refresh server components
        router.refresh();
      },
      // error handle
      onError(error) {
        if (error.message) {
          // Display toast message to the user to try again
          toast({
            variant: "destructive",
            description: "Something went wrong, plese try again."
          });
        } 
      },
    }); // from ai/react - vercel

  // OnSubmit
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const userMessage: ChatMessageProps = {
      role: 'user',
      content: input,
    };
    // add user message to messages
    setMessages((current) => [...current, userMessage]);

    handleSubmit(e);
  };

  return (
    <div className='flex flex-col h-full p-4 space-y-2'>
      <ChatHeader companion={companion} />
      <ChatMessages
        companion={companion}
        isLoading={isLoading}
        messages={messages}
      />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};
