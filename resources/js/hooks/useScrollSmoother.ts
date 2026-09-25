import { useLayoutEffect } from 'react';
import { ScrollSmoother, ScrollTrigger } from '../lib/gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// Layout effect so the smoother exists before child sections create their
// ScrollTriggers (child useEffects run after every layout effect).
export function useScrollSmoother() {
    const prefersReducedMotion = usePrefersReducedMotion();

    useLayoutEffect(() => {
        if (prefersReducedMotion) {
            return;
        }

        const smoother = ScrollSmoother.create({
            wrapper: '#smooth-wrapper',
            content: '#smooth-content',
            smooth: 1.2,
            smoothTouch: 0.1,
            effects: true,
        });

        let cancelled = false;

        document.fonts.ready.then(() => {
            if (!cancelled) {
                ScrollTrigger.refresh();
            }
        });

        return () => {
            cancelled = true;
            smoother.kill();
        };
    }, [prefersReducedMotion]);
}
