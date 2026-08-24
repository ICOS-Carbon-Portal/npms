import { RefObject, useEffect, useRef } from 'react';

/**
 * Hook for detecting pointer interaction outside `ref` while `active`, using
 * pointerdown so it fires before the outside target takes focus.
 */
export function useOutsideInteraction(
	ref: RefObject<HTMLElement>,
	active: boolean,
	onOutside: () => void,
): void {
	// Latest-ref pattern: a new closure each render would otherwise re-subscribe,
	// and the listener could call a stale one
	const handler = useRef(onOutside);
	handler.current = onOutside;

	useEffect(() => {
		if (!active) return;

		const onPointerDown = (e: PointerEvent) => {
			const root = ref.current;
			if (root && !root.contains(e.target as Node)) handler.current();
		};

		document.addEventListener('pointerdown', onPointerDown);
		return () => document.removeEventListener('pointerdown', onPointerDown);
	}, [ref, active]);
}
