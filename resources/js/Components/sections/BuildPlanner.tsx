import { useEffect, useRef, useState } from 'react';
import { BUILD_GOALS } from '../../data/buildGoals';
import { TOWER_HEIGHT, TOWER_LIGHTS, TOWER_WIDTH } from '../../data/towerLights';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { SectionCircuit, type Layout } from '../circuit/SectionCircuit';
import { PlanBar } from './PlanBar';
import { PlanDialog } from './PlanDialog';
import { TowerLights } from './TowerLights';

// The circuit: in on the right where the showreel's rail ended, across the
// top and down the left margin.
const circuitRoute = ({ height, leftMargin, rightMargin }: Layout) => {
    const from = rightMargin('.reel');
    const to = leftMargin('.plan__inner');

    return [
        [
            [from, 0],
            [from, 64],
            [to, 64],
            [to, height],
        ] as [number, number][],
    ];
};

// Phones and small tablets: the tower moves below the options, and a docked bar
// gives live feedback while choosing.
const MOBILE = '(max-width: 900px)';

// "What should we build?": the visitor picks what they want, and each pick
// switches on another band of lights up the Eiffel Tower and adds the first
// thing we'd build for it to a plan beside the choices. The button opens a
// popup asking for name, email and phone, which sends the picks straight to the
// lead inbox; hovering it (and a sent plan) sets the whole tower sparkling.
// The section slides up over "See what we've built" like a new page.
//
// On phones the big tower sits after the options and lights band by band as it
// scrolls into view (the reveal), while a bar docked to the bottom of the
// screen shows a mini tower lighting with each tap and keeps the button close.
export function BuildPlanner() {
    const sectionRef = useRef<HTMLElement>(null);
    const visualRef = useRef<HTMLDivElement>(null);
    const [barInRange, setBarInRange] = useState(false);
    const [picked, setPicked] = useState<string[]>([]);
    const [sparkle, setSparkle] = useState(false);
    const [asking, setAsking] = useState(false);
    const [celebrating, setCelebrating] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();

    const toggle = (id: string) => {
        const adding = !picked.includes(id);

        // A light tap of feedback on phones that support it.
        if (adding && window.matchMedia(MOBILE).matches) {
            navigator.vibrate?.(12);
        }

        setPicked((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
    };

    const chosen = BUILD_GOALS.filter((goal) => picked.includes(goal.id));
    const bands = Math.min(picked.length, TOWER_LIGHTS.length);

    // Phones: show the docked bar from when the options arrive until the main
    // button comes into view; reveal the big tower's lights as it scrolls in.
    useEffect(() => {
        const section = sectionRef.current;
        const visual = visualRef.current;

        if (!section || !visual) {
            return;
        }

        const media = gsap.matchMedia();

        media.add(MOBILE, () => {
            ScrollTrigger.create({
                trigger: section.querySelector('.plan__options'),
                start: 'top 85%',
                endTrigger: section.querySelector('.plan__cta'),
                end: 'top bottom',
                onToggle: (self) => setBarInRange(self.isActive),
            });

            if (prefersReducedMotion) {
                return;
            }

            let timer = 0;
            visual.classList.add('is-unseen');
            ScrollTrigger.create({
                trigger: visual,
                start: 'top 70%',
                onEnter: () => {
                    visual.classList.remove('is-unseen');
                    visual.classList.add('is-revealing');
                    timer = window.setTimeout(() => visual.classList.remove('is-revealing'), 2400);
                },
                onLeaveBack: () => visual.classList.add('is-unseen'),
            });

            return () => {
                window.clearTimeout(timer);
                visual.classList.remove('is-unseen', 'is-revealing');
                setBarInRange(false);
            };
        });

        return () => media.revert();
    }, [prefersReducedMotion]);

    // A sent plan sets the tower sparkling for a moment.
    useEffect(() => {
        if (!celebrating) {
            return;
        }

        const timer = window.setTimeout(() => setCelebrating(false), 3200);

        return () => window.clearTimeout(timer);
    }, [celebrating]);

    // Page transition: the previous section holds and eases back while this
    // one slides up over it, its rounded top corners flattening as it lands.
    useEffect(() => {
        const section = sectionRef.current;
        const previous = section?.previousElementSibling as HTMLElement | null;

        if (!section || !previous || prefersReducedMotion) {
            return;
        }

        const ctx = gsap.context(() => {
            const range = { start: 'bottom bottom', end: () => `+=${window.innerHeight}` };

            ScrollTrigger.create({ trigger: previous, ...range, pin: true, pinSpacing: false });

            gsap.fromTo(
                Array.from(previous.children).filter((child) => !child.matches('svg')),
                { scale: 1, autoAlpha: 1 },
                {
                    scale: 0.94,
                    autoAlpha: 0.25,
                    ease: 'none',
                    transformOrigin: '50% 100%',
                    scrollTrigger: { trigger: previous, ...range, scrub: true },
                },
            );

            // Its circuit fades with it, but isn't scaled, so the traces stay aligned.
            gsap.fromTo(
                previous.querySelectorAll(':scope > svg'),
                { autoAlpha: 1 },
                { autoAlpha: 0.25, ease: 'none', scrollTrigger: { trigger: previous, ...range, scrub: true } },
            );

            gsap.fromTo(
                section,
                { borderTopLeftRadius: 40, borderTopRightRadius: 40 },
                {
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    ease: 'none',
                    scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true },
                },
            );
        });

        return () => ctx.revert();
    }, [prefersReducedMotion]);

    // New lines in the plan rise in as they are picked.
    const previousCount = useRef(0);
    useEffect(() => {
        const section = sectionRef.current;
        const items = section?.querySelectorAll('.plan__step');

        if (items && picked.length > previousCount.current && !prefersReducedMotion) {
            gsap.from(items[items.length - 1], { autoAlpha: 0, y: 14, duration: 0.5, ease: 'power3.out' });
        }

        previousCount.current = picked.length;
    }, [picked, prefersReducedMotion]);

    return (
        <section ref={sectionRef} className="plan" aria-labelledby="plan-title">
            <SectionCircuit route={circuitRoute} />
            <div className="plan__inner">
                <div
                    ref={visualRef}
                    className={`plan__visual${sparkle || celebrating ? ' is-sparkling' : ''}`}
                >
                    <div className="plan__tower">
                        <img src="/images/eiffel.webp" alt="" width={TOWER_WIDTH} height={TOWER_HEIGHT} />
                        <TowerLights lit={bands} />
                    </div>
                    <p className="plan__meter" aria-live="polite">
                        {bands === 0
                            ? 'Every pick switches on the next level.'
                            : bands >= TOWER_LIGHTS.length
                              ? 'Fully lit.'
                              : `${bands} of ${TOWER_LIGHTS.length} levels lit`}
                    </p>
                </div>

                <div className="plan__panel">
                    <div className="advisory__tag">
                        <span>[</span>LET'S BUILD<span>]</span>
                    </div>
                    <h2 id="plan-title" className="plan__title">
                        What are you trying to build?
                    </h2>
                    <p className="plan__intro">
                        Pick everything that fits. No forms, no jargon: you'll see where we'd start
                        before you ever talk to us.
                    </p>

                    <p className="plan__prompt" id="plan-prompt">
                        I want to…
                    </p>
                    <div className="plan__options" role="group" aria-labelledby="plan-prompt">
                        {BUILD_GOALS.map((goal) => {
                            const on = picked.includes(goal.id);

                            return (
                                <button
                                    key={goal.id}
                                    type="button"
                                    className={`plan__option${on ? ' is-on' : ''}`}
                                    aria-pressed={on}
                                    onClick={() => toggle(goal.id)}
                                >
                                    <span className="plan__switch" aria-hidden="true">
                                        <span className="plan__knob" />
                                    </span>
                                    {goal.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className={`plan__answer${chosen.length ? ' has-steps' : ''}`} aria-live="polite">
                        <p className="plan__answer-title">Here's where we'd start</p>
                        {chosen.length ? (
                            <ol className="plan__steps">
                                {chosen.map((goal) => (
                                    <li key={goal.id} className="plan__step">
                                        <strong>{goal.title}</strong>
                                        <span>{goal.start}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="plan__empty">Your starting plan appears here as you choose.</p>
                        )}
                    </div>

                    <button
                        type="button"
                        className={`plan__cta${chosen.length ? ' is-live' : ''}`}
                        onClick={() => setAsking(true)}
                        onPointerEnter={() => setSparkle(true)}
                        onPointerLeave={() => setSparkle(false)}
                        onFocus={() => setSparkle(true)}
                        onBlur={() => setSparkle(false)}
                        aria-haspopup="dialog"
                    >
                        {chosen.length ? 'Talk to FlipSwitch about this plan' : 'Talk to FlipSwitch'}{' '}
                        <span aria-hidden="true">→</span>
                    </button>

                    <PlanBar visible={barInRange && !asking} lit={bands} onTalk={() => setAsking(true)} />

                    <PlanDialog
                        open={asking}
                        goals={chosen}
                        onClose={() => setAsking(false)}
                        onSent={() => setCelebrating(true)}
                    />
                </div>
            </div>
        </section>
    );
}
