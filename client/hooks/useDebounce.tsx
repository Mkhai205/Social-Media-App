import { useEffect, useState, useRef } from "react";

function useDebounce(value: string, delay: number): string {
    const [debouncedValue, setDebouncedValue] = useState(value);

    const handler = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        handler.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            if (handler.current) {
                clearTimeout(handler.current);
            }
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
