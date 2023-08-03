// Component to display each message - includes the icons for edit and delete
'use client';

import { useTheme } from 'next-themes';
import { BeatLoader } from 'react-spinners';
import { Copy } from 'lucide-react';


import { useToast } from './ui/use-toast';
import { cn } from '@/lib/utils';
import { BotAvatar } from './bot-avatar';
import { UserAvatar } from './user-avatar';
import { Button } from './ui/button';


export interface ChatMessageProps {
  role: 'user' | 'system';
  content?: string;
  isLoading?: boolean;
  src?: string;
}

export const ChatMessage = ({
  role,
  content,
  isLoading,
  src,
}: ChatMessageProps) => {
  const { toast } = useToast();
  const { theme } = useTheme();

  // Copy Function
  const onCopy = () => {
    if (!content) {
      return;
    }
    navigator.clipboard.writeText(content);
    toast({
      description: 'Copied to clipboard!',
    });
  };

  return (
    <div
    // add classname "group" to the div to use group-hover
      className={cn(
        'group flex item-start gap-x-3 py-4 w-full',
        role === 'user' && 'justify-end'
      )}
    >
      {role !== 'user' && src && <BotAvatar src={src} />}
      <div className='rounded-md px-4 py-2 max-w-small text-sm bg-primary/10'>
        {isLoading 
        ? <BeatLoader 
        color={theme === "light" ? "black" : "white"}
        size={5}
        /> 
        : content
        }
      </div>
      {role === 'user' && <UserAvatar />}
      {/* copy clipboard */}
      {role !== "user" && !isLoading && (
        <Button
        onClick={onCopy}
        // use group-hover to show the Copy button when hover
        className='opacity-0 group-hover:opacity-100 transition'
        size="icon"
        variant="ghost"
        >
            <Copy 
            className='h-4 w-4'
            />

        </Button>
      )}
    </div>
  );
};
