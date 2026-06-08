import { Link } from '@inertiajs/react';
import { Fragment, useRef, useState } from 'react';
import { useHeroEntrance } from '../../hooks/useHeroEntrance';
import { useHeroHeadlineFlicker } from '../../hooks/useHeroHeadlineFlicker';
import {
    BRAND_LINE_ONE,
    formatBrandLineTwo,
    PHRASE_PREFIX,
    SWITCH_PHRASES,
    useHeroTaglineRotate,
} from '../../hooks/useHeroTaglineRotate';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { SiteHeader } from '../SiteHeader';

const HERO_WORK_ITEMS = [
    {
        index: '001',
        title: 'AI Opportunity Mapping',
        description:
            'We find where automation pays for itself—before you invest in what will not.',
        icon: 'signal',
    },
    {
        index: '002',
        title: 'Workflow Engineering',
        description:
            'We fix the handoffs that leak time, leads, and revenue from your operations.',
        icon: 'orbit',
    },
    {
        index: '003',
        title: 'Custom AI Systems',
        description:
            'Practical tools that cut manual load, improve visibility, and help you scale.',
        icon: 'frame',
    },
    {
        index: '004',
        title: 'Implementation Strategy',
        description:
            'What to automate, what to keep human, and how to prove ROI—spelled out upfront.',
        icon: 'network',
    },
];

const HERO_HEADLINE_LINES = [
    ['AI', 'only', 'where'],
    ['it', 'creates'],
    ['real', 'value.'],
] as const;

export function HeroSection() {
    const heroRef = useRef<HTMLElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const brandWordRef = useRef<HTMLSpanElement>(null);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const prefersReducedMotion = usePrefersReducedMotion();
    const activePhrase = prefersReducedMotion
        ? SWITCH_PHRASES.at(-1)!
        : SWITCH_PHRASES[phraseIndex];

    useHeroEntrance(heroRef);
    useHeroHeadlineFlicker(headlineRef);
    useHeroTaglineRotate(brandWordRef, phraseIndex, setPhraseIndex, { startDelay: 1.25 });

    return (
        <section ref={heroRef} className="hero home-hero" aria-labelledby="home-hero-title">
            <div className="hero-backdrop" aria-hidden="true" />

            <SiteHeader variant="hero" />

            <div className="hero__inner">
                <div className="hero__tagline" aria-hidden="true">
                    <div
                        className="hero__display-brand"
                        aria-label={`${BRAND_LINE_ONE} ${formatBrandLineTwo(activePhrase)}`}
                    >
                        <span className="hero__brand-line">{BRAND_LINE_ONE}</span>
                        <span
                            className="hero__brand-line hero__brand-line--second"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            <span ref={brandWordRef} className="hero__brand-word">
                                {formatBrandLineTwo(activePhrase)}
                            </span>
                        </span>
                    </div>
                </div>

                <div className="hero__message">
                    <div className="hero__headline-col">
                        <Link href="/contact" className="hero__eyebrow">
                            ↘ Start with a discovery call
                        </Link>
                        <h1 id="home-hero-title" ref={headlineRef} className="hero__display-word">
                            {HERO_HEADLINE_LINES.map((line, lineIndex) => (
                                <span key={lineIndex} className="hero__display-line">
                                    {line.map((word, wordIndex) => (
                                        <Fragment key={wordIndex}>
                                            {wordIndex > 0 ? ' ' : null}
                                            <span className="hero__display-word-item">{word}</span>
                                        </Fragment>
                                    ))}
                                </span>
                            ))}
                        </h1>
                    </div>

                    <div className="hero__statement">
                        <p className="hero__statement-copy">
                            We do not sell AI because it is trending. We embed with your team,
                            find the bottlenecks bleeding time and revenue, and build what
                            creates measurable value—or tell you when AI is not the answer.
                        </p>
                        <Link href="/services" className="hero__statement-cta">
                            <span className="hero__statement-cta-label">See how we work</span>
                            <span className="hero__statement-cta-arrow" aria-hidden="true">&#8594;</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="hero__work-strip" aria-label="Featured FlipSwitch capabilities">
                <p className="hero__work-label">/work</p>
                <div className="hero__work-grid">
                    {HERO_WORK_ITEMS.map((item) => (
                        <article key={item.index} className="hero__work-card">
                            <span className="hero__work-index">{item.index}</span>
                            <span
                                className={`hero__work-icon hero__work-icon--${item.icon}`}
                                aria-hidden="true"
                            />
                            <h2>{item.title}</h2>
                            <p>{item.description}</p>
                        </article>
                    ))}
                </div>
            </div>

            <span className="sr-only">
                {PHRASE_PREFIX}
                {SWITCH_PHRASES.map((phrase) => `${phrase}. `).join('')}
                AI only where it creates real value. We do not sell AI because it is trending. We
                embed with your team, find the bottlenecks bleeding time and revenue, and build
                what creates measurable value—or tell you when AI is not the answer.
            </span>
        </section>
    );
}
