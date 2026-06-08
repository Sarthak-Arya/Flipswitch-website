import { useEffect } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useScrollReveal(selector = '[data-reveal]') {
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (prefersReducedMotion) {
            return;
        }

        const elements = gsap.utils.toArray<HTMLElement>(selector);

        const animations = elements.map((element) =>
            gsap.fromTo(
                element,
                { autoAlpha: 0, y: 24 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                    },
                },
            ),
        );

        return () => {
            animations.forEach((animation) => animation.kill());
        };
    }, [prefersReducedMotion, selector]);
}
