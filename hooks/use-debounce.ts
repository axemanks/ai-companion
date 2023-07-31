// We don't want to seach immediately after every keystroke when entrying a search term.
// Instead we need to "debounce" - have it wait and only search after a certain amount of time has passed.
// This is a common pattern when working with search inputs.

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

        return () => {
            // return cleanup function to remove any timers
            clearTimeout(timer);
        }
    }, [value, delay]);

    return debouncedValue;
};