import { useEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';

const FLICKER_START_DELAY = 1.2;
const FLICKER_HOLD = 0.4;

const GLOW_NONE =
    '0 0 0 rgba(120, 200, 255, 0), 0 0 0 rgba(120, 200, 255, 0)';
const GLOW_SOFT =
    '0 0 28px rgba(120, 200, 255, 0.45), 0 0 56px rgba(120, 200, 255, 0.18)';
const GLOW_STRONG =
    '0 0 44px rgba(120, 200, 255, 0.82), 0 0 88px rgba(120, 200, 255, 0.38)';

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function pickRandomWord(words: HTMLElement[], last?: HTMLElement): HTMLElement {
    if (words.length === 1) {
        return words[0];
    }

    let pick = words[Math.floor(Math.random() * words.length)];

    while (pick === last) {
        pick = words[Math.floor(Math.random() * words.length)];
    }

    return pick;
}

function resetWords(words: HTMLElement[]) {
    gsap.set(words, { opacity: 1, textShadow: GLOW_NONE });
}

function buildWordFlicker(word: Element) {
    return gsap
        .timeline({ defaults: { overwrite: 'auto' } })
        .to(word, { opacity: 0.12, textShadow: GLOW_NONE, duration: 0.045, ease: 'steps(1)' })
        .to(word, { opacity: 1, textShadow: GLOW_STRONG, duration: 0.065, ease: 'steps(1)' })
        .to(word, { opacity: 0.35, textShadow: GLOW_SOFT, duration: 0.04, ease: 'steps(1)' })
        .to(word, { opacity: 0.08, textShadow: GLOW_NONE, duration: 0.05, ease: 'steps(1)' })
        .to(word, { opacity: 1, textShadow: GLOW_STRONG, duration: 0.09, ease: 'power2.out' });
}

export function useHeroHeadlineFlicker(headlineRef: RefObject<HTMLHeadingElement | null>) {
    useEffect(() => {
        const headline = headlineRef.current;

        if (!headline || prefersReducedMotion()) {
            return;
        }

        const words = Array.from(
            headline.querySelectorAll<HTMLElement>('.hero__display-word-item'),
        );

        if (words.length === 0) {
            return;
        }

        let lastWord: HTMLElement | undefined;
        let glowBreath: gsap.core.Tween | null = null;
        let pendingDelay: gsap.core.Tween | null = null;
        let cancelled = false;

        const stopGlowBreath = () => {
            glowBreath?.kill();
            glowBreath = null;
        };

        const scheduleRound = () => {
            if (cancelled) {
                return;
            }

            const word = pickRandomWord(words, lastWord);
            lastWord = word;

            resetWords(words);

            stopGlowBreath();
            glowBreath = gsap.fromTo(
                word,
                { textShadow: GLOW_NONE },
                {
                    textShadow: GLOW_SOFT,
                    duration: 1.35,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1,
                },
            );

            gsap
                .timeline({
                    onComplete: () => {
                        if (cancelled) {
                            return;
                        }

                        stopGlowBreath();
                        gsap.set(word, { textShadow: GLOW_NONE, opacity: 1 });
                        pendingDelay?.kill();
                        pendingDelay = gsap.delayedCall(FLICKER_HOLD, scheduleRound);
                    },
                })
                .add(buildWordFlicker(word), 0);
        };

        const ctx = gsap.context(() => {
            resetWords(words);
            gsap.delayedCall(FLICKER_START_DELAY, scheduleRound);
        }, headline);

        return () => {
            cancelled = true;
            pendingDelay?.kill();
            stopGlowBreath();
            ctx.revert();
        };
    }, [headlineRef]);
}
