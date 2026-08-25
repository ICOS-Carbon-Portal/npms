import { useState } from 'react';

/**
 * Hook for keeping content mounted through its exit animation, 
 * using a render-phase setState rather than an Effect.
 */
export function useMountTransition(open: boolean): readonly [boolean, () => void] {
	const [mounted, setMounted] = useState(open);

	// Terminates because the update falsifies the condition: `mounted` becomes
	// true, so the re-render React triggers here won't call this again
	if (open && !mounted) {
		setMounted(true);
	}

	return [mounted, () => setMounted(false)] as const;
}
