import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { PROJECTS, type Project } from '../../data/projects';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { ShowcaseCircuit } from '../circuit/ShowcaseCircuit';
import { mockPlayer, PROJECT_MOCKS, type MockPlayer } from './projectMocks';

// Generic system events for the live-feed divider (not client data).
const FEED = [
    'Call answered · intent: booking',
    'Lead routed to sales',
    'Invoice sent',
    'Campaign delivered',
    'CRM record updated',
    'Follow-up scheduled',
    'Ticket resolved automatically',
    'Report generated',
];

// Seconds each project stays on stage before the reel advances.
const DWELL_SECONDS = 8;
// Gap between cards in the carousel, in px.
const CARD_GAP = 16;

// A card's slot relative to the active one: 0 active, 1 peeking next, and the
// card before the active one at -1 (off the left edge), so the reel loops.
function slotOf(index: number, active: number, count: number) {
    const rel = (((index - active) % count) + count) % count;

    return count > 2 && rel === count - 1 ? -1 : rel;
}

type ShowcaseSectionProps = {
    // Problems ticked in the checklist (ids from data/pains.ts).
    ticked: string[];
};

const pad = (n: number) => String(n).padStart(2, '0');

function ProjectMedia({ project }: { project: Project }) {
    if (project.video) {
        return (
            <video
                className="reel__video"
                muted
                loop
                playsInline
                preload="none"
                poster={project.video.poster}
                aria-hidden="true"
            >
                <source src={project.video.loop} type="video/mp4" />
            </video>
        );
    }

    return <div className="reel__mock">{PROJECT_MOCKS[project.id]}</div>;
}

// "See what we've built" as a showreel: a story column (counter, result,
// problem and system, progress, prev/next) beside a looping carousel of large
// project cards, where the active card is big and the next one peeks in (the
// first again after the last). The reel advances on its own while on screen,
// pausing on hover; only the active card's mock-up (or video) plays. The
// circuit's branch into the carousel makes the cards flicker on.
export function ShowcaseSection({ ticked }: ShowcaseSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const storyRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLSpanElement>(null);
    const playersRef = useRef<(MockPlayer | null)[]>([]);
    const progressTween = useRef<gsap.core.Tween | null>(null);
    const inView = useRef(false);
    const hovering = useRef(false);
    const [active, setActive] = useState(0);
    // The active index for callbacks that outlive a render.
    const activeRef = useRef(active);
    activeRef.current = active;
    // Direction of the last move (1 = next, -1 = previous) and each card's slot.
    const directionRef = useRef(1);
    const slotsRef = useRef<number[]>([]);
    const prefersReducedMotion = usePrefersReducedMotion();
    const count = PROJECTS.length;
    const project = PROJECTS[active];

    const move = (delta: 1 | -1) => {
        directionRef.current = delta;
        setActive((current) => (((current + delta) % count) + count) % count);
    };

    // Mock-up players, one per card.
    useEffect(() => {
        const stage = stageRef.current;

        if (!stage) {
            return;
        }

        playersRef.current = Array.from(stage.querySelectorAll<HTMLElement>('.reel__card')).map((card) => {
            const mock = card.querySelector<HTMLElement>('.reel__mock');

            return mock ? mockPlayer(card.dataset.project as Project['id'], mock) : null;
        });

        return () => playersRef.current.forEach((player) => player?.kill());
    }, []);

    // Play only while the section is on screen; pause the reel on hover.
    useEffect(() => {
        const section = sectionRef.current;

        if (!section) {
            return;
        }

        const sync = () => {
            const running = inView.current && !hovering.current;

            if (running) {
                progressTween.current?.resume();
            } else {
                progressTween.current?.pause();
            }
        };

        const trigger = ScrollTrigger.create({
            trigger: section.querySelector('.reel__body'),
            start: 'top 75%',
            end: 'bottom 25%',
            onToggle: (self) => {
                inView.current = self.isActive;
                sync();
                const player = playersRef.current[activeRef.current];

                if (self.isActive) {
                    player?.play();
                } else {
                    player?.pause();
                }
            },
        });

        const body = section.querySelector('.reel__body')!;
        const enter = () => {
            hovering.current = true;
            sync();
        };
        const leave = () => {
            hovering.current = false;
            sync();
        };

        body.addEventListener('pointerenter', enter);
        body.addEventListener('pointerleave', leave);

        return () => {
            trigger.kill();
            body.removeEventListener('pointerenter', enter);
            body.removeEventListener('pointerleave', leave);
        };
    }, []);

    // Each change of project: slide the carousel, swap the story, restart the
    // progress bar and play the new card's mock-up.
    useEffect(() => {
        const stage = stageRef.current;
        const story = storyRef.current;
        const progress = progressRef.current;

        if (!stage || !story || !progress) {
            return;
        }

        const cards = Array.from(stage.querySelectorAll<HTMLElement>('.reel__card'));
        const step = (cards[0]?.offsetWidth ?? 0) + CARD_GAP;
        const instant = prefersReducedMotion;
        // First layout: place the cards without animating.
        const jump = instant || slotsRef.current.length === 0;
        const direction = directionRef.current;
        const look = (slot: number) => ({
            scale: slot === 0 ? 1 : 0.92,
            opacity: slot === 0 ? 1 : slot === 1 ? 0.55 : 0,
        });

        cards.forEach((card, i) => {
            const from = slotsRef.current[i];
            const to = slotOf(i, active, count);
            const vars = { x: to * step, ...look(to), duration: jump ? 0 : 0.9, ease: 'power3.inOut' };

            gsap.killTweensOf(card);

            if (!jump && direction === 1 && from === -1 && to >= 1) {
                // Wrapped from the far left: re-enter from beyond the right edge.
                gsap.set(card, { x: (to + 1) * step, ...look(to + 1) });
                gsap.to(card, vars);
            } else if (!jump && direction === -1 && from >= 1 && to === -1) {
                // Wrapped from the right: leave to the right, then park on the left.
                gsap.to(card, {
                    x: (from + 1) * step,
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power3.in',
                    onComplete: () => gsap.set(card, { x: to * step, ...look(to) }),
                });
            } else {
                gsap.to(card, vars);
            }

            slotsRef.current[i] = to;
        });

        if (!instant) {
            gsap.fromTo(
                story.querySelectorAll('.reel__swap'),
                { autoAlpha: 0, y: 14 },
                { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.25 },
            );
        }

        playersRef.current.forEach((player, i) => {
            if (i === active && inView.current) {
                player?.play();
            } else {
                player?.pause();
            }
        });
        stage.querySelectorAll<HTMLVideoElement>('.reel__video').forEach((video, i) => {
            if (i === active) {
                void video.play().catch(() => undefined);
            } else {
                video.pause();
            }
        });

        progressTween.current?.kill();

        if (instant) {
            gsap.set(progress, { scaleX: 1 });

            return;
        }

        progressTween.current = gsap.fromTo(
            progress,
            { scaleX: 0 },
            {
                scaleX: 1,
                duration: DWELL_SECONDS,
                ease: 'none',
                paused: !inView.current || hovering.current,
                onComplete: () => move(1),
            },
        );
    }, [active, prefersReducedMotion]);

    // Keep every card in its slot when the layout changes size.
    useEffect(() => {
        const stage = stageRef.current;

        if (!stage) {
            return;
        }

        const realign = () => {
            const cards = stage.querySelectorAll<HTMLElement>('.reel__card');
            const step = (cards[0]?.offsetWidth ?? 0) + CARD_GAP;

            cards.forEach((card, i) => {
                gsap.set(card, { x: slotOf(i, activeRef.current, count) * step });
            });
        };
        const observer = new ResizeObserver(realign);
        observer.observe(stage);

        return () => observer.disconnect();
    }, [count]);

    // Swipe on touch screens.
    useEffect(() => {
        const stage = stageRef.current;

        if (!stage) {
            return;
        }

        let startX = 0;
        const down = (event: PointerEvent) => {
            startX = event.clientX;
        };
        const up = (event: PointerEvent) => {
            const dx = event.clientX - startX;

            if (Math.abs(dx) > 40) {
                move(dx < 0 ? 1 : -1);
            }
        };

        stage.addEventListener('pointerdown', down);
        stage.addEventListener('pointerup', up);

        return () => {
            stage.removeEventListener('pointerdown', down);
            stage.removeEventListener('pointerup', up);
        };
    }, [count]);

    return (
        <section ref={sectionRef} className="show" aria-labelledby="show-title">
            <ShowcaseCircuit />

            <div className="show__feed" aria-hidden="true">
                <span className="show__live">
                    <i /> LIVE
                </span>
                <div className="show__ticker">
                    <div className="show__ticker-track">
                        {[...FEED, ...FEED].map((item, i) => (
                            <span key={i}>● {item}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="reel">
                <div className="reel__head">
                    <div>
                        <div className="advisory__tag">
                            <span>[</span>SHOW ME<span>]</span>
                        </div>
                        <h2 id="show-title" className="reel__title">
                            See what we've
                            <br />
                            built.
                        </h2>
                    </div>
                    <p className="reel__intro">
                        Real systems, running in real businesses. Each one started as a problem
                        like the ones above.
                    </p>
                </div>

                <div className="reel__body" aria-roledescription="carousel" aria-label="Projects">
                    <div ref={storyRef} className="reel__story" aria-live="polite">
                        <p className="reel__count">
                            <span className="reel__swap reel__count-now">{pad(active + 1)}</span>
                            <span className="reel__count-total">/{pad(count)}</span>
                        </p>

                        <h3 className="reel__swap reel__result">{project.result}</h3>

                        <dl className="reel__swap reel__flow">
                            <div>
                                <dt>Problem</dt>
                                <dd>{project.problem}</dd>
                            </div>
                            <div>
                                <dt>System</dt>
                                <dd>{project.system}</dd>
                            </div>
                        </dl>

                        <Link href="/work" className="reel__swap reel__cta">
                            View case study <span aria-hidden="true">→</span>
                        </Link>

                        <div className="reel__controls">
                            <span className="reel__progress" aria-hidden="true">
                                <span ref={progressRef} />
                            </span>
                            <div className="reel__buttons">
                                <button type="button" className="reel__button" onClick={() => move(-1)} aria-label="Previous project">
                                    ←
                                </button>
                                <button
                                    type="button"
                                    className="reel__button reel__button--next"
                                    onClick={() => move(1)}
                                    aria-label="Next project"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>

                    <div ref={stageRef} className="reel__stage">
                        <div className="reel__track">
                            {PROJECTS.map((item, i) => {
                                const isMatch = item.answers.some((pain) => ticked.includes(pain));

                                return (
                                    <article
                                        key={item.id}
                                        className={`reel__card${i === active ? ' is-active' : ''}${isMatch ? ' is-match' : ''}`}
                                        data-project={item.id}
                                        style={{ '--i': i } as React.CSSProperties}
                                        aria-hidden={i !== active}
                                        onClick={() => slotOf(i, active, count) === 1 && move(1)}
                                    >
                                        <div className="reel__media">
                                            <ProjectMedia project={item} />
                                        </div>

                                        <div className="reel__pills">
                                            <span className="reel__pill">{item.tags[0]}</span>
                                            {isMatch ? (
                                                <span className="reel__pill reel__pill--match">Matches what you ticked</span>
                                            ) : null}
                                        </div>

                                        {item.walkthrough ? (
                                            <a
                                                className="reel__watch"
                                                href={item.walkthrough}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                tabIndex={i === active ? 0 : -1}
                                            >
                                                ▶ Watch walkthrough
                                            </a>
                                        ) : null}

                                        <div className="reel__caption">
                                            <h4 className="reel__name">{item.name}</h4>
                                            <p className="reel__summary">{item.summary}</p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <p className="reel__all">
                    <Link href="/work">
                        See all work <span aria-hidden="true">→</span>
                    </Link>
                </p>
            </div>
        </section>
    );
}
