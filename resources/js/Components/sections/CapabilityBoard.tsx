import { Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { CAPABILITIES, type Capability } from '../../data/capabilities';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { ScrollTrigger } from '../../lib/gsap';
import { BuildCircuit } from '../circuit/BuildCircuit';
import { CAPABILITY_ART } from './capabilityArt';

// Switches in the divider row (fewer show on small screens).
const WAVE_SWITCHES = 24;

// The phrase in AI Systems' example that gets the highlighted pill.
const AI_HIGHLIGHT = 'drafts the reply';

type CapabilityBoardProps = {
    // Problems ticked in the checklist above (ids from data/pains.ts).
    ticked: string[];
};

function ExampleText({ capability }: { capability: Capability }) {
    if (capability.id !== 'ai' || !capability.example.includes(AI_HIGHLIGHT)) {
        return <>{capability.example}</>;
    }

    const [before, after] = capability.example.split(AI_HIGHLIGHT);

    return (
        <>
            {before}
            <mark className="bento__mark">{AI_HIGHLIGHT}</mark>
            {after}
        </>
    );
}

// "What we build" as a bento grid: light cards of varied sizes with wireframe
// illustrations, AI Systems as the featured black card and Custom Engineering
// as the full-width catch-all. A wave of switches marks the section; the
// circuit powers each card, and cards answering the problems the visitor
// ticked are highlighted and powered first.
export function CapabilityBoard({ ticked }: CapabilityBoardProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    const matches = (capability: Capability) =>
        capability.answers.some((pain) => ticked.includes(pain));
    const matchCount = CAPABILITIES.filter(matches).length;

    // Divider: the switches flip on in a wave as the section arrives.
    useEffect(() => {
        const section = sectionRef.current;

        if (!section) {
            return;
        }

        if (prefersReducedMotion) {
            section.classList.add('is-switched');

            return;
        }

        const trigger = ScrollTrigger.create({
            trigger: section,
            start: 'top 75%',
            onEnter: () => section.classList.add('is-switched'),
            onLeaveBack: () => section.classList.remove('is-switched'),
        });

        return () => trigger.kill();
    }, [prefersReducedMotion]);

    return (
        <section ref={sectionRef} className="build" aria-labelledby="build-title">
            <BuildCircuit />

            <div className="build__wave" aria-hidden="true">
                {Array.from({ length: WAVE_SWITCHES }, (_, i) => (
                    <span key={i} className="build__wave-switch" style={{ '--i': i } as React.CSSProperties}>
                        <span className="build__wave-knob" />
                    </span>
                ))}
            </div>

            <div className="build__head">
                <div className="advisory__tag">
                    <span>[</span>WHAT WE BUILD<span>]</span>
                </div>
                <h2 id="build-title" className="build__title">
                    From idea to intelligent business system.
                </h2>
                <p className="build__intro">
                    Six ways we turn problems into systems.
                    {matchCount > 0 ? (
                        <span className="build__intro-match">
                            {' '}
                            Highlighted: what fits the problems you ticked.
                        </span>
                    ) : null}
                </p>
            </div>

            <div className="bento">
                {CAPABILITIES.map((capability) => {
                    const isMatch = matches(capability);
                    const featured = capability.id === 'ai';

                    return (
                        <Link
                            key={capability.id}
                            href="/services"
                            className={`bento__card bento__card--${capability.id}${featured ? ' bento__card--featured' : ''}${isMatch ? ' is-match' : ''}`}
                            data-capability={capability.id}
                        >
                            <div className="bento__top">
                                <h3 className="bento__title">{capability.title}</h3>
                                <span className="bento__arrow" aria-hidden="true">
                                    ↗
                                </span>
                            </div>

                            {isMatch ? <span className="bento__match">Matches what you ticked</span> : null}

                            <svg className="bento__art" viewBox="0 0 240 180" aria-hidden="true">
                                {CAPABILITY_ART[capability.id]}
                            </svg>

                            <div className="bento__body">
                                <p className="bento__outcome">{capability.outcome}</p>
                                <ul className="bento__chips" aria-label="Includes">
                                    {capability.includes.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                                <p className="bento__example">
                                    <span>e.g.</span> <ExampleText capability={capability} />
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
