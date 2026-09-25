import { useEffect, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { gsap } from '../../lib/gsap';

type SectionWipeProps = {
    // The section being revealed; the wipe runs while its top scrolls from
    // `start` up to the top of the screen.
    targetRef: RefObject<HTMLElement | null>;
    label: string;
    // Late enough that the previous section has mostly been read.
    start?: string;
};

// A page-transition curtain between two sections, scrubbed by scroll: a
// deep-blue panel wipes up over the screen, a switch flips on, then the panel
// wipes away upwards to reveal the next section. Rendered into <body> so it can
// stay fixed while ScrollSmoother transforms the page content.
export function SectionWipe({ targetRef, label, start = 'top 45%' }: SectionWipeProps) {
    const wipeRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const wipe = wipeRef.current;
        const target = targetRef.current;

        if (!wipe || !target || prefersReducedMotion) {
            return;
        }

        const ctx = gsap.context(() => {
            gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: { trigger: target, start, end: 'top top', scrub: true },
            })
                .fromTo(
                    wipe,
                    { clipPath: 'inset(100% 0% 0% 0%)' },
                    { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.4 },
                    0,
                )
                .fromTo('.section-wipe__content', { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.22)
                .to('.section-wipe__knob', { x: 30, backgroundColor: '#06328c', duration: 0.12 }, 0.44)
                .to('.section-wipe__track', { backgroundColor: '#ffffff', duration: 0.12 }, 0.44)
                .to('.section-wipe__content', { autoAlpha: 0, y: -48, duration: 0.2 }, 0.62)
                .to(wipe, { clipPath: 'inset(0% 0% 100% 0%)', ease: 'power2.inOut', duration: 0.4 }, 0.6);
        }, wipe);

        return () => ctx.revert();
    }, [prefersReducedMotion, targetRef, start]);

    return createPortal(
        <div ref={wipeRef} className="section-wipe" aria-hidden="true">
            <div className="section-wipe__content">
                <span className="section-wipe__track">
                    <span className="section-wipe__knob" />
                </span>
                <p className="section-wipe__label">{label}</p>
            </div>
        </div>,
        document.body,
    );
}
