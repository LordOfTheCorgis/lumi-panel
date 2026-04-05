import { useEffect, useRef } from 'react';
import { useStoreState } from 'easy-peasy';
import { useToast } from '@/components/elements/Toast';
import { FlashMessage } from '@/state/flashes';

/**
 * Bridges the easy-peasy flash store → toast notification system.
 * Renders no DOM; just listens for new flash messages and converts them to toasts.
 */
const FlashToastBridge = () => {
    const flashes = useStoreState((state) => state.flashes.items);
    const { addToast } = useToast();
    const prevFlashes = useRef<FlashMessage[]>([]);

    useEffect(() => {
        // Find new flashes that weren't in the previous set
        const prev = prevFlashes.current;
        const newFlashes = flashes.filter(
            (flash) => !prev.some((p) => p.id === flash.id && p.message === flash.message && p.type === flash.type)
        );

        newFlashes.forEach((flash) => {
            addToast({
                type: flash.type,
                title: flash.title,
                message: flash.message,
            });
        });

        prevFlashes.current = flashes;
    }, [flashes, addToast]);

    return null;
};

export default FlashToastBridge;
