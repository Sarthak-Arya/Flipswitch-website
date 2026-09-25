import { useEffect, useRef, useState } from 'react';
import { PROCESS_STEPS } from '../../data/process';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { SectionCircuit, type Layout } from '../circuit/SectionCircuit';
import { ProcessSchematic } from './ProcessSchematic';

const MOBILE = '(max-width: 900px)';

// The page's circuit joins the steps' own rail: down the left margin and into
// "You're here", then on from the lamp at the bottom.
const circuitRoute = ({ height, box, leftMargin }: Layout) => {
    const x = leftMargin('.plan__inner');
    const start = box('.how__start-dot');
    const lamp = box('.how__end-lamp');

    return [
        [
            [x, 0],
            [x, start.cy],
            [start.left, start.cy],
        ],
        [
            [lamp.cx, lamp.bottom],
            [lamp.cx, height],
        ],
    ] as [number, number][][];
};
// Where the current's head sits while scrolling (fraction of the viewport; on
// phones, of the space below the pinned diagram).
const HEAD_LINE = 0.55;
const MOBILE_HEAD_LINE = 0.5;

// "How it works": the process as a circuit. A trace runs down the steps from
// "You're here" (already lit: reading this counts as the first move) and each
// step is a switch the current flips on as it passes, powering that step's
// card. Beside it, pinned, the system itself goes from a sketch to live as
// the switches flip, and at the bottom the lamp lights: FlipSwitched.
// On phones the diagram pins to the top of the screen and the steps scroll
// under it.
export function HowItWorks() {
    const sectionRef = useRef<HTMLElement>(null);
    const [stage, setStage] = useState(0);
    const [live, setLive] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();
    const total = PROCESS_STEPS.length;

    useEffect(() => {
        const section = sectionRef.current;

        if (!section) {
            return;
        }

        const list = section.querySelector<HTMLElement>('.how__steps')!;
        const pin = section.querySelector<HTMLElement>('.how__visual-pin')!;
        const fill = section.querySelector<HTMLElement>('.how__rail-fill')!;
        const dot = section.querySelector<HTMLElement>('.how__rail-head')!;
        const steps = Array.from(section.querySelectorAll<HTMLElement>('.how__step'));
        const switches = steps.map((step) => step.querySelector<HTMLElement>('.how__switch')!);
        const end = section.querySelector<HTMLElement>('.how__end-lamp')!;

        if (prefersReducedMotion) {
            steps.forEach((step) => step.classList.add('is-on'));
            fill.style.transform = 'scaleY(1)';
            setStage(total);
            setLive(true);

            return;
        }

        const mobile = window.matchMedia(MOBILE);
        let marks: number[] = [];
        let endAt = 0;
        let railStart = 0;
        let railLength = 1;
        let lastY = NaN;
        let lastStage = -1;
        let lastLit = false;

        // Where each switch (and the lamp) sits along the rail.
        const measure = () => {
            const top = list.getBoundingClientRect().top;
            const centre = (el: HTMLElement) => {
                const r = el.getBoundingClientRect();

                return r.top + r.height / 2 - top;
            };

            railStart = centre(section.querySelector<HTMLElement>('.how__start-dot')!);
            endAt = centre(end);
            railLength = Math.max(1, endAt - railStart);
            marks = switches.map(centre);
            list.style.setProperty('--rail-top', `${railStart}px`);
            list.style.setProperty('--rail-height', `${railLength}px`);
            lastY = NaN;
        };

        const render = () => {
            const top = list.getBoundingClientRect().top;
            const line = mobile.matches
                ? pin.offsetHeight + (window.innerHeight - pin.offsetHeight) * MOBILE_HEAD_LINE
                : window.innerHeight * HEAD_LINE;
            const y = Math.round(line - top);

            if (y === lastY) {
                return;
            }

            lastY = y;
            const progress = Math.min(1, Math.max(0, (y - railStart) / railLength));
            fill.style.transform = `scaleY(${progress})`;
            dot.style.transform = `translateY(${progress * railLength}px)`;
            dot.style.opacity = progress > 0 && progress < 1 ? '1' : '0';

            let reached = 0;
            marks.forEach((mark, i) => {
                const on = y >= mark;
                steps[i].classList.toggle('is-on', on);
                reached += on ? 1 : 0;
            });

            if (reached !== lastStage) {
                lastStage = reached;
                setStage(reached);
            }

            // The lamp lights when the current arrives at the bottom.
            const lit = y >= endAt;

            if (lit !== lastLit) {
                lastLit = lit;
                setLive(lit);
            }
        };

        const media = gsap.matchMedia();

        // Desktop: the diagram holds in the middle of the screen beside the steps.
        media.add('(min-width: 901px)', () => {
            ScrollTrigger.create({
                trigger: list,
                start: () => `top ${(window.innerHeight - pin.offsetHeight) / 2}`,
                end: () => `bottom ${(window.innerHeight + pin.offsetHeight) / 2}`,
                pin,
                pinSpacing: false,
            });
        });

        // Phones: it holds at the top while the steps scroll under it.
        media.add(MOBILE, () => {
            ScrollTrigger.create({
                trigger: pin,
                start: 'top top',
                endTrigger: list,
                end: () => `bottom ${pin.offsetHeight + window.innerHeight * 0.3}`,
                pin,
                pinSpacing: false,
            });
        });

        const resize = new ResizeObserver(() => measure());

        measure();
        resize.observe(list);
        ScrollTrigger.addEventListener('refresh', measure);
        gsap.ticker.add(render);

        return () => {
            resize.disconnect();
            ScrollTrigger.removeEventListener('refresh', measure);
            gsap.ticker.remove(render);
            media.revert();
        };
    }, [prefersReducedMotion, total]);

    const current = PROCESS_STEPS[Math.max(0, Math.min(stage, total) - 1)];

    return (
        <section ref={sectionRef} className={`how${live ? ' is-live' : ''}`} aria-labelledby="how-title">
            <SectionCircuit route={circuitRoute} />
            <div className="how__inner">
                <header className="how__head">
                    <div className="advisory__tag">
                        <span>[</span>HOW IT WORKS<span>]</span>
                    </div>
                    <h2 id="how-title" className="how__title">
                        From one conversation
                        <br />
                        <span className="how__title-end">to a working system.</span>
                    </h2>
                    <p className="how__intro">
                        No black box. Here's exactly what happens after you get in touch, what you'll
                        have at every step, and when you decide whether to go further.
                    </p>
                </header>

                <div className="how__body">
                    <ol className="how__steps">
                        <li className="how__rail" aria-hidden="true">
                            <span className="how__rail-fill" />
                            <span className="how__rail-head" />
                        </li>

                        <li className="how__start">
                            <span className="how__start-dot" aria-hidden="true" />
                            <p>
                                <strong>You're here.</strong> Everything below starts with one
                                conversation.
                            </p>
                        </li>

                        {PROCESS_STEPS.map((step) => (
                            <li key={step.id} className="how__step">
                                <span className="how__switch" aria-hidden="true">
                                    <span className="how__knob" />
                                </span>
                                <article className="how__card">
                                    <p className="how__eyebrow">
                                        <span className="how__number">{step.number}</span>
                                        {step.name}
                                    </p>
                                    <h3 className="how__step-title">{step.title}</h3>
                                    <p className="how__description">{step.description}</p>
                                    <dl className="how__terms">
                                        <div>
                                            <dt>You get</dt>
                                            <dd>{step.youGet}</dd>
                                        </div>
                                        <div>
                                            <dt>Your part</dt>
                                            <dd>{step.yourPart}</dd>
                                        </div>
                                    </dl>
                                    {step.decision ? <p className="how__decision">{step.decision}</p> : null}
                                </article>
                            </li>
                        ))}

                        <li className="how__end">
                            <span className="how__end-lamp" aria-hidden="true" />
                            <div>
                                <p className="how__end-title">FlipSwitched.</p>
                                <p className="how__end-copy">A working system, running in your business.</p>
                            </div>
                        </li>
                    </ol>

                    <div className="how__visual" aria-hidden={stage === 0}>
                        <div className="how__visual-pin">
                            <div className="how__screen">
                                <p className="how__status">
                                    <span className="how__status-dot" />
                                    {stage === 0 ? 'Waiting for the first switch' : `Stage ${current.number} of 0${total}`}
                                    <strong>{stage === 0 ? 'Idea' : current.system}</strong>
                                </p>
                                <ProcessSchematic stage={stage} />
                                <ol className="how__stages">
                                    {PROCESS_STEPS.map((step, i) => (
                                        <li
                                            key={step.id}
                                            className={i < stage ? (i === stage - 1 ? 'is-current' : 'is-done') : ''}
                                        >
                                            {step.system}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
