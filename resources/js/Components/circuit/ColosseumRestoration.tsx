import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { BLUEPRINT, IMAGE_HEIGHT, IMAGE_WIDTH, LIGHTS } from './colosseum';

const LIGHT_PEAK = 0.85;
const GHOST_PEAK = 0.55;
// Space kept clear of blueprint lines around the hero text, in screen px.
const TEXT_CLEARANCE = 36;

// A quick stutter on, like a lamp catching.
function flickerOn(light: Element, peak: number) {
    return gsap
        .timeline()
        .to(light, { opacity: peak * 0.9, duration: 0.05 })
        .to(light, { opacity: peak * 0.15, duration: 0.07 })
        .to(light, { opacity: peak, duration: 0.14 });
}

// Laid over the Colosseum etching. When the circuit powers the hero heading,
// the ruined outer wall redraws itself as a blueprint, then light chases
// through every arch from the tower round to the far end of the arena.
export function ColosseumRestoration() {
    const svgRef = useRef<SVGSVGElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const svg = svgRef.current;
        const intro = svg?.closest<HTMLElement>('.advisory__intro');
        const heading = intro?.querySelector('.advisory__display');

        if (!svg || !intro || !heading) {
            return;
        }

        const all = <T extends Element>(selector: string) => Array.from(svg.querySelectorAll<T>(selector));
        const blueprint = svg.querySelector('.colosseum__blueprint')!;
        const region = svg.querySelector('.colosseum__region')!;
        const strokes = all('.colosseum__stroke');
        const outline = all('.colosseum__outline');
        const cornices = all('.colosseum__cornice');
        const pilasters = all('.colosseum__pilaster');
        const openings = all('.colosseum__opening');
        const details = all('.colosseum__detail');
        const lightLayer = svg.querySelector('.colosseum__lights')!;
        const lights = all<SVGGElement>('.colosseum__light').sort(
            (a, b) => Number(a.dataset.x) - Number(b.dataset.x),
        );
        const textFade = svg.querySelector('.colosseum__text-fade')!;

        const peakOf = (light: SVGGElement) => (light.dataset.ghost ? GHOST_PEAK : LIGHT_PEAK);

        // Keep strokes 1px on screen however the image is scaled, and fade the
        // blueprint out behind the hero text so the copy stays readable.
        const measure = () => {
            const box = svg.getBoundingClientRect();

            if (!box.width) {
                return;
            }

            const unit = IMAGE_WIDTH / box.width;
            svg.style.setProperty('--colosseum-unit', String(unit));

            const rects = Array.from(
                intro.querySelectorAll(':scope > :not(.advisory__illustration)'),
            ).map((element) => element.getBoundingClientRect());

            const left = Math.min(...rects.map((r) => r.left));
            const right = Math.max(...rects.map((r) => r.right));
            const top = Math.min(...rects.map((r) => r.top));
            const bottom = Math.max(...rects.map((r) => r.bottom));

            // An ellipse circumscribing the text box, plus clearance.
            textFade.setAttribute('cx', String(((left + right) / 2 - box.left) * unit));
            textFade.setAttribute('cy', String(((top + bottom) / 2 - box.top) * unit));
            textFade.setAttribute('rx', String(((right - left) / 2 * Math.SQRT2 + TEXT_CLEARANCE) * unit));
            textFade.setAttribute('ry', String(((bottom - top) / 2 * Math.SQRT2 + TEXT_CLEARANCE) * unit));
        };

        const reset = () => {
            gsap.set(strokes, { strokeDashoffset: 100 });
            gsap.set(region, { opacity: 0 });
            gsap.set(lights, { opacity: 0 });
            gsap.set([blueprint, lightLayer], { opacity: 1 });
        };

        let timeline: gsap.core.Timeline | null = null;

        const powerOn = () => {
            measure();
            timeline?.kill();
            reset();

            if (prefersReducedMotion) {
                gsap.set(strokes, { strokeDashoffset: 0 });
                gsap.set(region, { opacity: 1 });
                lights.forEach((light) => gsap.set(light, { opacity: peakOf(light) }));

                return;
            }

            // Rim first, then cornices, columns and openings, left to right.
            timeline = gsap
                .timeline()
                .to(region, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0)
                .to(outline, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0)
                .to(cornices, { strokeDashoffset: 0, duration: 0.9, ease: 'power1.inOut', stagger: 0.08 }, 0.3)
                .to(pilasters, { strokeDashoffset: 0, duration: 0.3, ease: 'none', stagger: { amount: 0.7 } }, 0.55)
                .to(openings, { strokeDashoffset: 0, duration: 0.45, ease: 'power1.out', stagger: { amount: 0.8 } }, 0.75)
                .to(details, { strokeDashoffset: 0, duration: 0.5, ease: 'power1.out', stagger: { amount: 0.7 } }, 0.9);

            // Then the chase: each arch catches as the wave passes it.
            const xs = lights.map((light) => Number(light.dataset.x));
            const first = Math.min(...xs);
            const span = Math.max(...xs) - first || 1;

            lights.forEach((light, i) => {
                timeline!.add(flickerOn(light, peakOf(light)), 1.3 + (1.6 * (xs[i] - first)) / span);
            });
        };

        const powerOff = () => {
            timeline?.kill();
            timeline = gsap.timeline({ onComplete: reset }).to([blueprint, lightLayer], {
                opacity: 0,
                duration: 0.3,
            });
        };

        const handlePower = (event: Event) => {
            if ((event as CustomEvent<boolean>).detail) {
                powerOn();
            } else {
                powerOff();
            }
        };

        reset();
        measure();

        if (heading.classList.contains('is-powered')) {
            powerOn();
        }

        heading.addEventListener('circuit:power', handlePower);
        ScrollTrigger.addEventListener('refresh', measure);

        return () => {
            heading.removeEventListener('circuit:power', handlePower);
            ScrollTrigger.removeEventListener('refresh', measure);
            timeline?.kill();
        };
    }, [prefersReducedMotion]);

    return (
        <svg
            ref={svgRef}
            className="colosseum"
            viewBox={`0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}`}
            aria-hidden="true"
        >
            <defs>
                <radialGradient id="colosseum-light-fill" cx="50%" cy="60%" r="70%">
                    <stop offset="0%" stopColor="#1356c9" />
                    <stop offset="100%" stopColor="#06328c" />
                </radialGradient>
                <filter id="colosseum-bloom" x="-150%" y="-100%" width="400%" height="300%">
                    <feGaussianBlur stdDeviation="9" />
                </filter>
                <clipPath id="colosseum-missing">
                    <path d={BLUEPRINT.region} />
                </clipPath>
                <radialGradient id="colosseum-text-gradient">
                    <stop offset="0%" stopColor="#000" />
                    <stop offset="62%" stopColor="#000" />
                    <stop offset="100%" stopColor="#fff" />
                </radialGradient>
                <mask
                    id="colosseum-text-mask"
                    maskUnits="userSpaceOnUse"
                    x={-IMAGE_WIDTH}
                    y={-IMAGE_HEIGHT}
                    width={IMAGE_WIDTH * 3}
                    height={IMAGE_HEIGHT * 3}
                >
                    <rect
                        x={-IMAGE_WIDTH}
                        y={-IMAGE_HEIGHT}
                        width={IMAGE_WIDTH * 3}
                        height={IMAGE_HEIGHT * 3}
                        fill="#fff"
                    />
                    <ellipse className="colosseum__text-fade" fill="url(#colosseum-text-gradient)" />
                </mask>
            </defs>

            <g className="colosseum__blueprint" mask="url(#colosseum-text-mask)">
                <path className="colosseum__region" d={BLUEPRINT.region} />
                <g clipPath="url(#colosseum-missing)">
                    {BLUEPRINT.cornices.map((d) => (
                        <path key={d} className="colosseum__stroke colosseum__cornice" d={d} pathLength={100} />
                    ))}
                    {BLUEPRINT.pilasters.map(({ d }) => (
                        <path key={d} className="colosseum__stroke colosseum__pilaster" d={d} pathLength={100} />
                    ))}
                    {BLUEPRINT.openings.map(({ d }) => (
                        <path key={d} className="colosseum__stroke colosseum__opening" d={d} pathLength={100} />
                    ))}
                    {BLUEPRINT.details.map(({ d }) => (
                        <path key={d} className="colosseum__stroke colosseum__detail" d={d} pathLength={100} />
                    ))}
                </g>
                {BLUEPRINT.outline.map((d) => (
                    <path key={d} className="colosseum__stroke colosseum__outline" d={d} pathLength={100} />
                ))}
            </g>

            <g className="colosseum__lights">
                {LIGHTS.filter((light) => !light.ghost).map((light) => (
                    <LightShape key={light.d} {...light} />
                ))}
                <g clipPath="url(#colosseum-missing)" mask="url(#colosseum-text-mask)">
                    {LIGHTS.filter((light) => light.ghost).map((light) => (
                        <LightShape key={light.d} {...light} />
                    ))}
                </g>
            </g>
        </svg>
    );
}

function LightShape({ d, x, ghost }: { d: string; x: number; ghost: boolean }) {
    return (
        <g className="colosseum__light" data-x={x.toFixed(1)} data-ghost={ghost ? 'true' : undefined}>
            <path d={d} className="colosseum__bloom" filter="url(#colosseum-bloom)" />
            <path d={d} className="colosseum__glass" fill="url(#colosseum-light-fill)" />
        </g>
    );
}
