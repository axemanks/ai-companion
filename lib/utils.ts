// installed when shadcn init was run
// This combines tailwinds and css classes

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to create absolute URL for stripe - it navagates to the stripe checkout page and needs to know how to get back
// pass in a path - return full url
export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}
