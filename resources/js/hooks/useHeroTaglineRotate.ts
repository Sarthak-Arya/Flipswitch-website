import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export const SWITCH_PHRASES = [
    'Scale',
    'Clarity',
    'Freedom',
    'Growth',
    'Intelligence',
    'Speed',
    'Results',
    "What's Next",
] as const;

export const BRAND_LINE_ONE = 'Flip the Switch';
export const BRAND_LINE_TWO_PREFIX = 'to ';
/** Longest second line: `to What's Next.` — used for equal line widths in CSS */
export const BRAND_LINE_CH = 17;

const PHRASE_PREFIX = `${BRAND_LINE_ONE} ${BRAND_LINE_TWO_PREFIX.trim()} `;

export function formatBrandLineTwo(phrase: string): string {
    return `${BRAND_LINE_TWO_PREFIX}${phrase}.`;
}

export function useHeroTaglineRotate(
    wordRef: RefObject<HTMLSpanElement | null>,
    phraseIndex: number,
    setPhraseIndex: Dispatch<SetStateAction<number>>,
    options?: { startDelay?: number },
) {
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const word = wordRef.current;

        if (!word || prefersReducedMotion) {
            return;
        }

        let cancelled = false;

        const ctx = gsap.context(() => {
            const phrase = SWITCH_PHRASES[phraseIndex];
            const holdFor = (label: string) => (label === "What's Next" ? 3.6 : 2.4);

            const runCycle = () => {
                if (cancelled) {
                    return;
                }

                gsap.set(word, { y: 28, autoAlpha: 0, filter: 'blur(10px)' });

                const cycle = gsap.timeline({
                    onComplete: () => {
                        if (cancelled) {
                            return;
                        }

                        setPhraseIndex((current) => (current + 1) % SWITCH_PHRASES.length);
                    },
                });

                cycle
                    .to(word, {
                        y: 0,
                        autoAlpha: 1,
                        filter: 'blur(0px)',
                        duration: 0.85,
                        ease: 'power3.out',
                    })
                    .to({}, { duration: holdFor(phrase) })
                    .to(word, {
                        y: -22,
                        autoAlpha: 0,
                        filter: 'blur(8px)',
                        duration: 0.6,
                        ease: 'power3.in',
                    });
            };

            const delay = phraseIndex === 0 ? (options?.startDelay ?? 1.25) : 0;

            if (delay > 0) {
                gsap.delayedCall(delay, runCycle);
            } else {
                runCycle();
            }
        }, word);

        return () => {
            cancelled = true;
            ctx.revert();
        };
    }, [phraseIndex, prefersReducedMotion, options?.startDelay, setPhraseIndex, wordRef]);
}

export { PHRASE_PREFIX };
