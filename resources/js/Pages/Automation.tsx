import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { MarketingLayout } from '../Layouts/MarketingLayout';
import { gsap, ScrollSmoother, ScrollTrigger } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const CONTENTS = [
    { href: '#operations', label: 'Operations' },
    { href: '#where', label: 'Where it fits' },
    { href: '#sequence', label: 'How it runs' },
    { href: '#tools', label: 'Tools' },
    { href: '#workshop', label: 'Workshop' },
];

const GAINS = [
    {
        index: '01',
        title: 'Hours come back',
        text: 'Copying a record, chasing a status, and assembling the same report stop being someone’s afternoon.',
    },
    {
        index: '02',
        title: 'The step stays the same',
        text: 'A request is classified, routed, and logged the same way on a Tuesday night as on a Monday morning.',
    },
    {
        index: '03',
        title: 'The work is visible',
        text: 'A lead, a ticket, or a handoff has a state. Nobody has to ask who has it.',
    },
    {
        index: '04',
        title: 'People keep the judgment',
        text: 'The system drafts, files, and reminds. A person still decides the step that carries money, risk, or a relationship.',
    },
];

const LOOPS = [
    {
        title: 'Inbox and requests',
        text: 'Read the message, name what it is, and send it to the right queue with a draft reply attached.',
    },
    {
        title: 'Sales and accounts',
        text: 'After a call, write the note, update the record, and set the next follow-up before the day moves on.',
    },
    {
        title: 'Delivery',
        text: 'When a job is marked done, open the next task, the invoice line, and the note the client should see.',
    },
    {
        title: 'Company knowledge',
        text: 'Answer from the documents the company already has, and show which page the answer came from.',
    },
    {
        title: 'Reporting',
        text: 'Pull the numbers on a schedule and surface what moved, instead of rebuilding the sheet by hand.',
    },
    {
        title: 'Internal handoffs',
        text: 'Pass a finished step to the next team with the context attached, not a message that says “see above”.',
    },
];

const SEQUENCE = [
    {
        index: '01',
        title: 'Watch for a real event',
        text: 'A form arrives, a status changes, a mailbox receives a message. The automation starts from something that already happens.',
    },
    {
        index: '02',
        title: 'Read what the company knows',
        text: 'The step looks up the account, the policy, or the last ticket before it writes anything new.',
    },
    {
        index: '03',
        title: 'Do the safe part',
        text: 'File, label, draft, or remind. If the step can spend money or speak for the company, it waits for a person.',
    },
    {
        index: '04',
        title: 'Leave a record',
        text: 'What ran, what it changed, and what it skipped is written down, so the work can be checked later.',
    },
];

const TOOLS = [
    {
        role: 'Systems you already run',
        name: 'Inbox, CRM, help desk, ERP, sheets',
        text: 'Automation should write into the place the team already looks. A second tool that nobody opens does not count as operations.',
    },
    {
        role: 'Connectors',
        name: 'n8n, Make, Zapier',
        text: 'These move a record from one system to the next: the trigger, the fields, and the destination. They are the plumbing, not the decision.',
    },
    {
        role: 'Language models',
        name: 'ChatGPT, Claude, Gemini',
        text: 'Use them when the step needs reading, sorting, or a first draft. Keep them on a defined task, with the company’s own text as the source.',
    },
    {
        role: 'Oversight',
        name: 'Approvals, logs, evaluations',
        text: 'A human gate on the risky step, a log of every run, and a sample of outputs checked against what “good” means for that workflow.',
    },
];

// Same load-in as the homepage hero: header first, then the heading block
// rises in. Later sections use the same rise, started by scroll.
function useGuideMotion() {
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const root = document.querySelector('#smooth-content');

        if (!root || prefersReducedMotion) {
            return;
        }

        const ctx = gsap.context(() => {
            gsap.timeline({ defaults: { ease: 'power3.out' } })
                .from('.hdr', { autoAlpha: 0, y: -12, duration: 0.7 }, 0.1)
                .from('.guide__hero > *', { autoAlpha: 0, y: 32, duration: 0.9, stagger: 0.1 }, 0.2);

            gsap.utils.toArray<HTMLElement>('.guide__section, .guide__close').forEach((section) => {
                gsap.from(section.querySelectorAll(':scope > *'), {
                    autoAlpha: 0,
                    y: 32,
                    duration: 0.9,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: section, start: 'top 85%' },
                });
            });
        }, root);

        return () => ctx.revert();
    }, [prefersReducedMotion]);
}

function GuideHead({ tag, title, lead }: { tag: string; title: string; lead?: ReactNode }) {
    return (
        <header className="guide__head">
            <div className="advisory__tag">
                <span>[</span>
                {tag}
                <span>]</span>
            </div>
            <h2 className="advisory__heading">{title}</h2>
            {lead ? <p className="guide__lead">{lead}</p> : null}
        </header>
    );
}

function GuideCards({
    items,
    start,
    onHot,
}: {
    items: { title: string; text: string }[];
    start: number;
    onHot: (index: number | null) => void;
}) {
    return (
        <div className="advisory__cards">
            {items.map((item, index) => (
                <div
                    key={item.title}
                    className="advisory__card"
                    onMouseEnter={() => onHot(start + index)}
                    onMouseLeave={() => onHot(null)}
                    onFocus={() => onHot(start + index)}
                    onBlur={() => onHot(null)}
                >
                    <div className="advisory__card-title">{item.title}</div>
                    <p>{item.text}</p>
                </div>
            ))}
        </div>
    );
}

// A trunk down the margin with a tap into each card, drawn the way the footer
// board powers on: the blue trace runs in on scroll, and the hovered card's
// tap burns brighter.
function useGuideCircuit(prefersReducedMotion: boolean) {
    useEffect(() => {
        const article = document.querySelector<HTMLElement>('.guide');

        if (!article) {
            return;
        }

        const svg = article.querySelector<SVGSVGElement>('.guide__circuit');
        const trunk = svg ? Array.from(svg.querySelectorAll<SVGPathElement>('.guide__trunk path')) : [];
        const taps = svg ? Array.from(svg.querySelectorAll<SVGGElement>('.guide__tap')) : [];
        let powered = false;

        const build = () => {
            if (!svg) {
                return;
            }

            const chips = Array.from(article.querySelectorAll<HTMLElement>('.advisory__card, .guide__end'));
            // Offset positions ignore the entrance transform, so the trace stays
            // on the resting layout after the cards finish moving.
            const rect = (el: HTMLElement) => {
                let left = 0;
                let top = 0;
                let node: HTMLElement | null = el;

                while (node && node !== article) {
                    left += node.offsetLeft;
                    top += node.offsetTop;
                    node = node.offsetParent as HTMLElement | null;
                }

                return { left, top, width: el.offsetWidth, height: el.offsetHeight };
            };
            const boxes = chips.map(rect);

            if (!boxes.length) {
                return;
            }

            const x = Math.max(12, Math.round(Math.min(...boxes.map((b) => b.left)) / 2));
            const rows: { top: number; boxes: typeof boxes }[] = [];

            boxes.forEach((box) => {
                const row = rows.find((item) => Math.abs(item.top - box.top) < 12);

                if (row) {
                    row.boxes.push(box);
                } else {
                    rows.push({ top: box.top, boxes: [box] });
                }
            });

            const routes = rows.flatMap((row) => {
                const y = Math.round(row.top - 16);

                return row.boxes.map((b) => {
                    const cx = Math.round(b.left + b.width / 2);

                    return { d: `M${cx},${y} V${Math.round(b.top)}`, end: [cx, Math.round(b.top)] as const };
                });
            });
            const trunkD = rows.reduce((path, row, index) => {
                const y = Math.round(row.top - 16);
                const last = row.boxes[row.boxes.length - 1];
                const endX = Math.round(last.left + last.width / 2);

                return index === 0 ? `M${x},${y - 40} V${y} H${endX} H${x}` : `${path} V${y} H${endX} H${x}`;
            }, '');

            svg.setAttribute('viewBox', `0 0 ${article.offsetWidth} ${article.offsetHeight}`);
            svg.style.height = `${article.offsetHeight}px`;
            trunk.forEach((path) => path.setAttribute('d', trunkD));
            routes.forEach((route, i) => {
                taps[i]?.querySelectorAll('path').forEach((path) => path.setAttribute('d', route.d));
                const node = taps[i]?.querySelector('circle');

                node?.setAttribute('cx', String(route.end[0]));
                node?.setAttribute('cy', String(route.end[1]));
            });

            [trunk[1], ...taps.map((tap) => tap.querySelector<SVGPathElement>('.circuit__stub')!)].forEach((path) => {
                if (!path) {
                    return;
                }

                const length = path.getTotalLength() || 1;
                gsap.killTweensOf(path);
                path.style.strokeDasharray = `${length}`;
                path.style.strokeDashoffset = powered ? '0' : `${length}`;
            });
        };

        const powerOn = () => {
            if (powered || !trunk[1]) {
                return;
            }

            powered = true;
            const stubs = taps
                .map((tap) => tap.querySelector<SVGPathElement>('.circuit__stub'))
                .filter((path): path is SVGPathElement => path !== null);
            const duration = prefersReducedMotion ? 0 : 1.1;

            gsap.timeline()
                .to(trunk[1], { strokeDashoffset: 0, duration, ease: 'power1.inOut' })
                .to(stubs, { strokeDashoffset: 0, duration: duration * 0.35, stagger: duration * 0.04, ease: 'power1.out' })
                .call(() => taps.forEach((tap) => tap.querySelector('circle')?.classList.add('is-powered')));
        };

        const trigger = ScrollTrigger.create({ trigger: article, start: 'top 80%', onEnter: powerOn });
        const resize = new ResizeObserver(() => build());

        build();
        resize.observe(article);

        if (trigger.progress > 0 || prefersReducedMotion) {
            powerOn();
        }

        return () => {
            resize.disconnect();
            trigger.kill();
        };
    }, [prefersReducedMotion]);
}

function scrollToSection(event: MouseEvent<HTMLAnchorElement>) {
    const smoother = ScrollSmoother.get();
    const href = event.currentTarget.getAttribute('href');

    if (!smoother || !href) {
        return;
    }

    event.preventDefault();
    smoother.scrollTo(href, true, 'top 24px');
    window.history.replaceState(null, '', href);
}

const CARD_GROUPS = [GAINS.length, LOOPS.length, SEQUENCE.length, TOOLS.length, 1];

export default function Automation() {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [hot, setHot] = useState<number | null>(null);
    const taps = CARD_GROUPS.reduce((sum, count) => sum + count, 0) + 1;

    useGuideMotion();
    useGuideCircuit(prefersReducedMotion);

    return (
        <MarketingLayout>
            <Head title="AI automation for companies" />

            <article className="advisory guide">
                <svg className="guide__circuit" aria-hidden="true" preserveAspectRatio="none">
                    <g className="guide__trunk">
                        <path className="circuit__base" />
                        <path className="circuit__current" />
                    </g>
                    {Array.from({ length: taps }, (_, index) => (
                        <g key={index} className={`guide__tap${hot === index ? ' is-hot' : ''}`}>
                            <path className="circuit__stub-base" />
                            <path className="circuit__stub" />
                            <circle className="circuit__node" r="4" />
                        </g>
                    ))}
                </svg>
                <header className="guide__hero">
                    <div className="advisory__tag">
                        <span>[</span>AI AUTOMATION<span>]</span>
                    </div>
                    <h1 className="advisory__display">How a company works better when routine work runs itself.</h1>
                    <p className="advisory__intro-copy">
                        AI automation takes the repeated steps out of operations: the copy between tools, the follow-up
                        that slips, the report assembled by hand. The team keeps the judgment. The system keeps the
                        routine.
                    </p>
                    <nav className="guide__contents" aria-label="On this page">
                        {CONTENTS.map((item) => (
                            <a key={item.href} href={item.href} onClick={scrollToSection}>
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </header>

                <section id="operations" className="guide__section">
                    <GuideHead
                        tag="OPERATIONS"
                        title="Less chasing. Same standard."
                        lead="The gain is not a new dashboard. It is a step that used to wait for a person, and no longer does."
                    />
                    <GuideCards
                        start={0}
                        onHot={setHot}
                        items={GAINS.map((gain) => ({
                            title: `${gain.index} / ${gain.title}`,
                            text: gain.text,
                        }))}
                    />
                </section>

                <section id="where" className="guide__section">
                    <GuideHead
                        tag="WHERE IT FITS"
                        title="The loops between teams."
                        lead="A useful automation sits on a loop the company already runs. It does not invent a new process for its own sake."
                    />
                    <GuideCards start={GAINS.length} onHot={setHot} items={LOOPS} />
                </section>

                <section id="sequence" className="guide__section">
                    <GuideHead tag="HOW IT RUNS" title="One event. One record." lead="A sequence you can audit." />
                    <GuideCards
                        start={GAINS.length + LOOPS.length}
                        onHot={setHot}
                        items={SEQUENCE.map((step) => ({
                            title: `${step.index} / ${step.title}`,
                            text: step.text,
                        }))}
                    />
                </section>

                <section id="tools" className="guide__section">
                    <GuideHead
                        tag="TOOLS"
                        title="Use the stack you already have."
                        lead="Tools matter less than the job. Connect the systems people already trust, and put a model only on the step that needs language."
                    />
                    <GuideCards
                        start={GAINS.length + LOOPS.length + SEQUENCE.length}
                        onHot={setHot}
                        items={TOOLS.map((tool) => ({
                            title: tool.role,
                            text: `${tool.name}. ${tool.text}`,
                        }))}
                    />
                </section>

                <section id="workshop" className="guide__section">
                    <GuideHead tag="WORKSHOP" title="Resources for the room." lead="Not published yet." />
                    <GuideCards
                        start={GAINS.length + LOOPS.length + SEQUENCE.length + TOOLS.length}
                        onHot={setHot}
                        items={[
                            {
                                title: 'Coming next',
                                text: 'FlipSwitch Forward workshop documents. Guides for running this work inside a company will be added here. This section is intentionally empty until those documents are ready.',
                            },
                        ]}
                    />
                </section>

                <section className="guide__close">
                    <div className="advisory__tag">
                        <span>[</span>A NEXT STEP<span>]</span>
                    </div>
                    <h2 className="advisory__display advisory__display--cta">Start with one loop, not a platform.</h2>
                    <p className="advisory__intro-copy">
                        One conversation is enough to name the repeated step worth switching on first, and what should
                        stay with a person.
                    </p>
                    <Link
                        href="/contact"
                        className="advisory__btn advisory__btn--cta guide__end"
                        onMouseEnter={() => setHot(taps - 1)}
                        onMouseLeave={() => setHot(null)}
                        onFocus={() => setHot(taps - 1)}
                        onBlur={() => setHot(null)}
                    >
                        Book a call
                    </Link>
                </section>
            </article>
        </MarketingLayout>
    );
}
