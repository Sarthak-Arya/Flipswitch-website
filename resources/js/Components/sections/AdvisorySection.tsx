import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { AdvisoryCircuit } from '../circuit/AdvisoryCircuit';
import { HeroSwitch } from '../circuit/HeroSwitch';
import { ColosseumRestoration } from '../circuit/ColosseumRestoration';
import { SiteHeader } from '../SiteHeader';
import { FaqSection } from './FaqSection';
import { FinalCta } from './FinalCta';
import { FlipComparison } from './FlipComparison';
import { HowItWorks } from './HowItWorks';
import { LightsOut } from './LightsOut';
import { BuildPlanner } from './BuildPlanner';
import { CapabilityBoard } from './CapabilityBoard';
import { PainChecklist } from './PainChecklist';
import { ShowcaseSection } from './ShowcaseSection';
import { SectionWipe } from './SectionWipe';

const SERVICES = [
    {
        title: '01 / Strategy',
        description:
            'Opportunity mapping, build-vs-buy decisions and a roadmap tied to business metrics.',
    },
    {
        title: '02 / Build',
        description:
            'Custom agents, retrieval systems and integrations with the tools your teams already use.',
    },
    {
        title: '03 / Governance',
        description:
            'Evaluation, risk controls and audit trails that satisfy legal, security and regulators.',
    },
];

// Four, in the order a buyer weighs them: proof it works, the result, how
// fast, and whether people come back.
const STATS = [
    { value: '120+', label: 'AI systems shipped to production since 2021' },
    { value: '+38%', label: 'Average productivity gain in workflows we automate' },
    { value: '9 wks', label: 'Median time from kickoff to a live deployment' },
    { value: '94%', label: 'Of clients return for a second engagement' },
];

const STAT_BG = [233, 233, 231];
const STAT_FADE = [247, 247, 246];

function useStatStack(sectionRef: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        const section = sectionRef.current;

        if (!section) {
            return;
        }

        const cards = Array.from(section.querySelectorAll<HTMLElement>('.advisory__stat'));
        const count = cards.length;

        const update = (progress: number) => {
            const position = progress * (count - 1);

            cards.forEach((card, i) => {
                const d = i - position;
                let y: number, scale: number, opacity: number, z: number;

                if (d < 0) {
                    y = d * 120;
                    scale = 1;
                    opacity = Math.max(0, 1 + d * 1.6);
                    z = 100;
                } else {
                    y = d * 52;
                    scale = 1 - d * 0.07;
                    opacity = Math.max(0, 1 - d * 0.38);
                    z = 100 - Math.round(d * 10);
                }

                const k = Math.min(1, Math.max(0, d));
                const colour = STAT_BG.map((v, j) => Math.round(v + (STAT_FADE[j] - v) * k));
                const faded = d > 0.5;

                card.style.transform = `translateY(${y}px) scale(${scale})`;
                card.style.opacity = String(opacity);
                card.style.zIndex = String(z);
                card.style.background = `rgb(${colour})`;
                card.style.color = faded ? '#9a9a98' : '#141414';
                card.querySelector<HTMLElement>('.advisory__stat-label')!.style.color = faded
                    ? '#8a8a88'
                    : '#141414';
            });
        };

        // A GSAP pin instead of CSS sticky: sticky does not work inside ScrollSmoother.
        const trigger = ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            pin: section.querySelector('.advisory__stats-sticky'),
            pinSpacing: false,
            onUpdate: (self) => update(self.progress),
        });

        update(trigger.progress);

        return () => trigger.kill();
    }, [sectionRef]);
}

// Load-in for the hero: header first, then switch, heading, copy and button.
function useIntroEntrance(topRef: React.RefObject<HTMLElement | null>) {
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const top = topRef.current;

        if (!top || prefersReducedMotion) {
            return;
        }

        const ctx = gsap.context(() => {
            gsap.timeline({ defaults: { ease: 'power3.out' } })
                .from('.hdr', { autoAlpha: 0, y: -12, duration: 0.7 }, 0.1)
                .from(
                    '.advisory__intro > :not(.advisory__illustration)',
                    { autoAlpha: 0, y: 32, duration: 0.9, stagger: 0.1 },
                    0.2,
                )
                .from('.advisory__illustration-img', { autoAlpha: 0, duration: 1.4 }, 0.1);
        }, top);

        return () => ctx.revert();
    }, [prefersReducedMotion, topRef]);
}

export function AdvisorySection() {
    // Problems ticked in the checklist; "What we build" highlights what answers them.
    const [ticked, setTicked] = useState<string[]>([]);
    const togglePain = (id: string) =>
        setTicked((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
    const topRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLElement>(null);

    useIntroEntrance(topRef);
    useStatStack(statsRef);

    return (
        <div className="advisory">
            <AdvisoryCircuit />

            <div ref={topRef} className="advisory__top">
                <SiteHeader />

                <section className="advisory__intro" aria-labelledby="home-hero-title">
                    <div className="advisory__illustration" aria-hidden="true">
                        <img
                            src="/images/etching.webp"
                            alt=""
                            className="advisory__illustration-img"
                        />
                        <ColosseumRestoration />
                    </div>

                    <HeroSwitch />

                    {/* "AI systems," lights blue when the switch is flipped. */}
                    <h1 id="home-hero-title" className="advisory__display">
                        <span className="advisory__muted">AI systems,</span>
                        <br />
                        built to last.
                    </h1>
                    <p className="advisory__intro-copy">
                        We're an AI consulting and development team. We find where AI can save your
                        business time, build the systems that do it, and keep them running.
                    </p>
                    <a href="#advisory-contact" className="advisory__btn advisory__btn--intro">
                        Book a call
                    </a>
                </section>

                <section id="advisory-services" className="advisory__rail">
                    <div />
                    <div className="advisory__panel advisory__panel--services">
                        <div className="advisory__panel-diagonal" aria-hidden="true" />
                        <div className="advisory__panel-circle" aria-hidden="true" />

                        <div className="advisory__services-head">
                            <div className="advisory__services-title">
                                <div className="advisory__tag">
                                    <span>[</span>WHAT DO WE DO?<span>]</span>
                                </div>
                                <h3 className="advisory__heading">
                                    Advice that ships
                                    <br />
                                    to production
                                </h3>
                            </div>
                            <div className="advisory__services-copy">
                                <p>
                                    We help leadership teams decide where AI earns its place, then
                                    design, build and hand over the systems. Every engagement ends
                                    with something running, measured and owned by your team.
                                </p>
                            </div>
                        </div>

                        <div className="advisory__cards">
                            {SERVICES.map((service) => (
                                <div key={service.title} className="advisory__card">
                                    <div className="advisory__card-title">{service.title}</div>
                                    <p>{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div />
                </section>
            </div>

            <SectionWipe targetRef={statsRef} label="Switched on." />

            <section ref={statsRef} className="advisory__stats">
                <div className="advisory__stats-sticky">
                    <h3 className="advisory__heading advisory__stats-heading">
                        The consulting partner
                        <br />
                        that ships AI
                        <br />
                        to production
                    </h3>
                    <div className="advisory__stack">
                        {STATS.map((stat) => (
                            <div key={stat.value} className="advisory__stat">
                                <div className="advisory__stat-value">{stat.value}</div>
                                <div className="advisory__stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <FlipComparison />

            <PainChecklist ticked={ticked} onToggle={togglePain} />

            <CapabilityBoard ticked={ticked} />

            <ShowcaseSection ticked={ticked} />

            <BuildPlanner />

            <HowItWorks />

            <FaqSection />

            <LightsOut />

            <FinalCta />
        </div>
    );
}
