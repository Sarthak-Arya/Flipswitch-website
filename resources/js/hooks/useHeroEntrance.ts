import { useEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const DISPLAY_TITLE = 'FLIPSWITCH';

function queryAll<T extends Element>(
    root: ParentNode,
    selector: string,
): T[] {
    return Array.from(root.querySelectorAll<T>(selector));
}

export function useHeroEntrance(rootRef: RefObject<HTMLElement | null>) {
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const root = rootRef.current;

        if (!root || prefersReducedMotion) {
            return;
        }

        const hero = root;

        const ctx = gsap.context(() => {
            const header = hero.querySelector('.site-header--hero');
            const logo = hero.querySelector('.nav__logo');
            const cta = hero.querySelector('.nav__cta');
            const message = hero.querySelector('.hero__message');
            const statementCopy = hero.querySelector('.hero__statement-copy');
            const statementCta = hero.querySelector('.hero__statement-cta');
            const tagline = hero.querySelector('.hero__tagline');
            const brand = hero.querySelector('.hero__display-brand');
            const displayWord = hero.querySelector('.hero__display-word');
            const displayLines = queryAll(hero, '.hero__display-line');
            const workStrip = hero.querySelector('.hero__work-strip');
            const navLinks = queryAll(hero, '.nav__link');
            const headerItems = [logo, cta, ...navLinks].filter(Boolean);

            const fadeTargets = [message, tagline, workStrip, ...headerItems].filter(Boolean);

            const copyTargets = [brand, statementCopy, statementCta].filter(Boolean);

            gsap.set(fadeTargets, { autoAlpha: 0 });
            gsap.set(copyTargets, { autoAlpha: 0 });

            if (header) {
                gsap.set(header, { y: -18 });
            }

            gsap.set(headerItems, { y: -12 });

            if (message) {
                gsap.set(message, { y: 24 });
            }

            if (tagline) {
                gsap.set(tagline, { x: 20 });
            }

            if (workStrip) {
                gsap.set(workStrip, { y: 20 });
            }

            if (displayLines.length > 0) {
                gsap.set(displayLines, { y: 32, autoAlpha: 0 });
            }

            const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });

            if (header) {
                entrance.to(header, { y: 0, duration: 0.85 }, 0);
            }

            if (headerItems.length > 0) {
                entrance.to(
                    headerItems,
                    { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.05 },
                    0.12,
                );
            }

            if (message) {
                entrance.to(message, { autoAlpha: 1, y: 0, duration: 0.85 }, 0.2);
            }

            if (brand) {
                entrance.to(brand, { autoAlpha: 1, duration: 0.6 }, 0.32);
            }

            if (displayLines.length > 0) {
                entrance.to(
                    displayLines,
                    { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.08, ease: 'power3.out' },
                    0.28,
                );
            }

            if (statementCopy) {
                entrance.to(statementCopy, { autoAlpha: 1, duration: 0.7 }, 0.48);
            }

            if (statementCta) {
                entrance.to(statementCta, { autoAlpha: 1, duration: 0.65 }, 0.56);
            }

            if (tagline) {
                entrance.to(tagline, { autoAlpha: 1, x: 0, duration: 0.8 }, 0.38);
            }

            if (workStrip) {
                entrance.to(workStrip, { autoAlpha: 1, y: 0, duration: 0.75 }, 0.65);
            }

            if (displayWord) {
                entrance.add(() => {
                    gsap.fromTo(
                        displayWord,
                        {
                            textShadow:
                                '0 0 0 rgba(120, 200, 255, 0), 0 0 0 rgba(120, 200, 255, 0)',
                        },
                        {
                            textShadow:
                                '0 0 28px rgba(120, 200, 255, 0.45), 0 0 56px rgba(120, 200, 255, 0.18)',
                            duration: 3,
                            ease: 'sine.inOut',
                            yoyo: true,
                            repeat: -1,
                        },
                    );
                }, 1.05);
            }

            const headlineCol = hero.querySelector('.hero__headline-col');
            const parallaxX = headlineCol
                ? gsap.quickTo(headlineCol, 'x', { duration: 1.1, ease: 'power3.out' })
                : null;
            const parallaxY = headlineCol
                ? gsap.quickTo(headlineCol, 'y', { duration: 1.1, ease: 'power3.out' })
                : null;

            function handlePointerMove(event: PointerEvent) {
                const x = event.clientX / window.innerWidth - 0.5;
                const y = event.clientY / window.innerHeight - 0.5;

                parallaxX?.(x * -10);
                parallaxY?.(y * -6);
            }

            if (headlineCol) {
                hero.addEventListener('pointermove', handlePointerMove);
            }

            return () => {
                hero.removeEventListener('pointermove', handlePointerMove);
            };
        }, hero);

        return () => ctx.revert();
    }, [prefersReducedMotion, rootRef]);
}

export { DISPLAY_TITLE };
