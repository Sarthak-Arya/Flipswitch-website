import { Head, Link } from '@inertiajs/react';
import { useEffect, useId, useState } from 'react';
import { SiteHeader } from '../Components/SiteHeader';
import { MarketingLayout } from '../Layouts/MarketingLayout';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type ForwardTab = 'implementation' | 'resources';

const CARD_GLANCE_FEATURES = [
    '200 smart scans',
    'Personalised emails',
    'Lead scoring',
    'Active follow-ups',
];

function useForwardMotion(tab: ForwardTab) {
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const root = document.querySelector('#smooth-content');

        if (!root || prefersReducedMotion) {
            return;
        }

        const ctx = gsap.context(() => {
            gsap.timeline({ defaults: { ease: 'power3.out' } })
                .from('.fwd__banner', { autoAlpha: 0, y: -8, duration: 0.5 }, 0)
                .from('.hdr', { autoAlpha: 0, y: -12, duration: 0.7 }, 0.08)
                .from('.fwd__hero > *', { autoAlpha: 0, y: 28, duration: 0.85, stagger: 0.08 }, 0.18);
        }, root);

        return () => ctx.revert();
    }, [prefersReducedMotion]);

    useEffect(() => {
        const panel = document.querySelector('.fwd__panel');

        if (!panel || prefersReducedMotion) {
            return;
        }

        const tween = gsap.fromTo(
            panel.querySelectorAll('.fwd__card, .fwd__resources'),
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out' },
        );

        return () => {
            tween.kill();
        };
    }, [tab, prefersReducedMotion]);
}

export default function Forward() {
    const [tab, setTab] = useState<ForwardTab>('implementation');
    const tabsId = useId();
    const implementationId = `${tabsId}-implementation`;
    const resourcesId = `${tabsId}-resources`;

    useForwardMotion(tab);

    return (
        <MarketingLayout hideHeader>
            <Head title="FlipSwitch Forward" />

            <article className="fwd advisory">
                <a href="/contact" className="fwd__banner">
                    Free 45-min AI Business Audit + 20% off your first automation.{' '}
                    <span>Claim it</span>
                </a>
                <SiteHeader />

                <header className="fwd__hero">
                    <p className="fwd__context">Offer for event attendees · valid for a limited time</p>
                    <h1 className="fwd__title">
                        Don&apos;t just take AI home as knowledge.
                        <br />
                        Take it back as <em>implementation</em>.
                    </h1>
                    <p className="fwd__lead">
                        We don&apos;t sell automation for the sake of it. We start by understanding your
                        business. Pick the track that fits you.
                    </p>

                    <div className="fwd__hero-actions" role="group" aria-label="Primary actions">
                        <Link href="/contact" className="fwd__btn fwd__btn--primary">
                            Book Free Audit
                        </Link>
                        <a href="#card-glance" className="fwd__btn fwd__btn--ghost">
                            Get Card Glance
                        </a>
                    </div>

                    <div className="fwd__tabs" role="tablist" aria-label="Offer tracks">
                        <button
                            type="button"
                            role="tab"
                            id={`${tabsId}-tab-implementation`}
                            className={`fwd__tab${tab === 'implementation' ? ' is-active' : ''}`}
                            aria-selected={tab === 'implementation'}
                            aria-controls={implementationId}
                            tabIndex={tab === 'implementation' ? 0 : -1}
                            onClick={() => setTab('implementation')}
                        >
                            Implementation
                        </button>
                        <button
                            type="button"
                            role="tab"
                            id={`${tabsId}-tab-resources`}
                            className={`fwd__tab${tab === 'resources' ? ' is-active' : ''}`}
                            aria-selected={tab === 'resources'}
                            aria-controls={resourcesId}
                            tabIndex={tab === 'resources' ? 0 : -1}
                            onClick={() => setTab('resources')}
                        >
                            Resources
                        </button>
                    </div>
                </header>

                <section id="offers" className="fwd__offers" aria-label="FlipSwitch Forward offers">
                    {tab === 'implementation' ? (
                        <div
                            className="fwd__panel"
                            role="tabpanel"
                            id={implementationId}
                            aria-labelledby={`${tabsId}-tab-implementation`}
                        >
                            <div className="fwd__grid">
                                <article className="fwd__card fwd__card--done">
                                    <p className="fwd__card-label">Done for you</p>

                                    <div className="fwd__block">
                                        <h2 className="fwd__card-title">Free 45-minute AI Business Audit</h2>
                                        <p className="fwd__card-copy">
                                            We sit with you, understand how your business currently operates, and
                                            map where AI creates real leverage. No generic recommendations.
                                        </p>
                                        <h3 className="fwd__card-sub">
                                            Then, 20% off your first automation project
                                        </h3>
                                        <p className="fwd__card-copy">
                                            Managing your team, automating follow-ups, or tightening a handoff —
                                            we implement it at 20% off.
                                        </p>
                                        <div className="fwd__price">
                                            <span className="fwd__price-now">₹0</span>
                                            <span className="fwd__price-was">
                                                <s>₹2500</s>
                                            </span>
                                            <span className="fwd__price-note">45-minute session</span>
                                        </div>
                                        <Link href="/contact" className="fwd__btn fwd__btn--on-dark">
                                            Book my free audit
                                        </Link>
                                    </div>

                                    <div id="card-glance" className="fwd__block fwd__block--glance">
                                        <h2 className="fwd__card-title fwd__card-title--sm">Card Glance</h2>
                                        <p className="fwd__card-copy">
                                            Swap visiting cards at networking events without the pile of paper.
                                            Scan, capture, and keep the follow-up moving after the room clears.
                                        </p>
                                        <ul className="fwd__features">
                                            {CARD_GLANCE_FEATURES.map((feature) => (
                                                <li key={feature}>{feature}</li>
                                            ))}
                                        </ul>
                                        <div className="fwd__price">
                                            <span className="fwd__price-now">₹2,999</span>
                                            <span className="fwd__price-was">
                                                <s>₹3,500</s>
                                            </span>
                                            <span className="fwd__price-note">
                                                Special price for everyone at the event
                                            </span>
                                        </div>
                                        <Link href="/contact" className="fwd__btn fwd__btn--ghost-on-dark">
                                            Get Card Glance
                                        </Link>
                                    </div>
                                </article>

                                <article className="fwd__card fwd__card--diy" aria-label="Do it yourself">
                                    <p className="fwd__card-label">Do it yourself</p>
                                    <div className="fwd__diy-empty">
                                        <p className="fwd__diy-empty-title">Coming soon</p>
                                        <p className="fwd__diy-empty-copy">
                                            Self-serve tools for this track will land here. The slot stays open.
                                        </p>
                                    </div>
                                </article>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="fwd__panel"
                            role="tabpanel"
                            id={resourcesId}
                            aria-labelledby={`${tabsId}-tab-resources`}
                        >
                            <div className="fwd__resources">
                                <div className="advisory__tag">
                                    <span>[</span>RESOURCES<span>]</span>
                                </div>
                                <p className="fwd__diy-empty-title">Not published yet</p>
                                <p className="fwd__diy-empty-copy">
                                    Workshop documents and guides for running this work inside a company will be
                                    added here.
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                <section className="fwd__close">
                    <h2 className="fwd__close-title">One Flip Can Switch Everything.</h2>
                    <p className="fwd__close-copy">Start with a conversation about your business.</p>
                    <Link href="/contact" className="fwd__btn fwd__btn--primary">
                        Book Free Audit
                    </Link>
                </section>
            </article>
        </MarketingLayout>
    );
}
