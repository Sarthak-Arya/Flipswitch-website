import { Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { ScrollTrigger } from '../../lib/gsap';
import { FlipCircuit } from '../circuit/FlipCircuit';

const ROWS = [
    { vendor: 'Starts with a feature list', flipswitch: 'Starts with how you operate' },
    { vendor: 'Sells you tools', flipswitch: 'Fixes your bottlenecks' },
    { vendor: 'Ships and moves on', flipswitch: 'Stays and keeps improving' },
];

const STEPS = [
    {
        title: '01 / Understand',
        description: 'We map how work really moves: your workflows, bottlenecks and business rules.',
        outcome: 'You see exactly where time and money leak.',
    },
    {
        title: '02 / Build',
        description: 'We turn that map into software, AI and automation shaped around your team.',
        outcome: 'Less manual work, nothing new to relearn.',
    },
    {
        title: '03 / Improve',
        description: 'We keep tuning the system as your business changes.',
        outcome: 'It gets sharper every quarter, not outdated.',
    },
];

// Scroll progress (0–1) through the pinned table at which each row flips.
const FLIP_AT = [0.15, 0.45, 0.75];

// "Why FlipSwitch": a typical vendor vs FlipSwitch. The table pins while the
// visitor scrolls; the switch flips on and current runs down the centre wire,
// flipping each row from the vendor's habit to FlipSwitch's.
export function FlipComparison() {
    const trackRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const track = trackRef.current;
        const stage = track?.querySelector<HTMLElement>('.flip__stage');
        const table = track?.querySelector<HTMLElement>('.flip__table');
        const rows = Array.from(track?.querySelectorAll<HTMLElement>('.flip__row') ?? []);

        if (!track || !stage || !table) {
            return;
        }

        const setStep = (step: number) => {
            table.classList.toggle('is-on', step > 0);
            rows.forEach((row, i) => row.classList.toggle('is-flipped', i < step));
        };

        if (prefersReducedMotion) {
            track.classList.add('flip__track--static');
            setStep(ROWS.length);

            return () => track.classList.remove('flip__track--static');
        }

        const trigger = ScrollTrigger.create({
            trigger: track,
            start: 'top top',
            end: 'bottom bottom',
            pin: stage,
            pinSpacing: false,
            onUpdate: (self) => setStep(FLIP_AT.filter((at) => self.progress >= at).length),
        });

        return () => trigger.kill();
    }, [prefersReducedMotion]);

    return (
        <section className="flip" aria-labelledby="flip-title">
            <FlipCircuit />

            <div className="flip__head">
                <div className="advisory__tag">
                    <span>[</span>WHY FLIPSWITCH<span>]</span>
                </div>
                <h2 id="flip-title" className="flip__title">
                    {/* Struck out when the right-hand circuit connects. */}
                    <span className="flip__title-muted">
                        <span className="flip__strike">You don't need another software vendor.</span>
                    </span>
                    <span className="flip__title-claim">
                        You need a partner who understands <em>your business</em> first.
                    </span>
                </h2>
                <p className="flip__intro">
                    Most software projects start with a feature list. Ours start with how your
                    business actually runs: who does what, where work stalls, and what that costs
                    you every week.
                </p>
            </div>

            <div ref={trackRef} className="flip__track">
                <div className="flip__stage">
                    <div className="flip__table">
                        <div className="flip__header">
                            <span className="flip__label">A typical vendor</span>
                            <span className="flip__master" aria-hidden="true">
                                <span className="flip__master-knob" />
                            </span>
                            <span className="flip__label flip__label--us">FlipSwitch</span>
                            {/* Tap to the circuit rail; sized by FlipCircuit. */}
                            <span className="flip__tap" aria-hidden="true" />
                        </div>

                        {ROWS.map((row) => (
                            <div key={row.vendor} className="flip__row">
                                <p className="flip__vendor">
                                    <span>{row.vendor}</span>
                                </p>
                                <span className="flip__wire" aria-hidden="true" />
                                <p className="flip__us">{row.flipswitch}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flip__steps">
                {STEPS.map((step) => (
                    <div key={step.title} className="flip__step">
                        <div className="flip__step-title">{step.title}</div>
                        <div className="flip__step-body">
                            <p>{step.description}</p>
                            <p className="flip__step-outcome">{step.outcome}</p>
                        </div>
                    </div>
                ))}
            </div>

            <p className="flip__next">
                Not sure where to start?{' '}
                <Link href="/contact">
                    Book a 30-minute workflow review <span aria-hidden="true">→</span>
                </Link>
            </p>
        </section>
    );
}
