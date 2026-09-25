import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { DOUBTS, FAQS } from '../../data/faq';
import { ScrollSmoother, ScrollTrigger } from '../../lib/gsap';
import { SectionCircuit, type Layout } from '../circuit/SectionCircuit';

// The circuit: on from "How it works", across the top, down the right margin.
const circuitRoute = ({ height, box, rightMargin }: Layout) => {
    const from = box('.how__end-lamp').cx;
    const to = rightMargin('.faq__inner');

    return [
        [
            [from, 0],
            [from, 64],
            [to, 64],
            [to, height],
        ] as [number, number][],
    ];
};

// Google's FAQ rich results.
const STRUCTURED_DATA = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
});

// FAQ as "The Objection Board": the doubts that stop people getting in touch
// sit on the left, the questions that settle them on the right. Each question
// has the site's switch; opening one flips it on, and once every question
// behind a doubt has been read, that doubt is switched off (struck through,
// lit blue) and the counter moves towards "All clear". The first, biggest
// doubt (cost) starts open. It ends with a way to ask a person directly.
export function FaqSection() {
    const [open, setOpen] = useState<string[]>([FAQS[0].id]);
    const [seen, setSeen] = useState<string[]>([FAQS[0].id]);
    const listRef = useRef<HTMLDivElement>(null);

    const cleared = DOUBTS.filter((doubt) =>
        FAQS.filter((faq) => faq.doubt === doubt.id).every((faq) => seen.includes(faq.id)),
    );
    const allClear = cleared.length === DOUBTS.length;

    const toggle = (id: string) => {
        setOpen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
        setSeen((current) => (current.includes(id) ? current : [...current, id]));
    };

    // Picking a doubt opens its questions and brings them into view.
    const showDoubt = (doubt: string) => {
        const ids = FAQS.filter((faq) => faq.doubt === doubt).map((faq) => faq.id);
        setOpen((current) => [...new Set([...current, ...ids])]);
        setSeen((current) => [...new Set([...current, ...ids])]);

        const target = listRef.current?.querySelector<HTMLElement>(`[data-doubt="${doubt}"]`);
        const smoother = ScrollSmoother.get();

        if (target && window.matchMedia('(max-width: 900px)').matches) {
            if (smoother) {
                smoother.scrollTo(target, true, 'top 30%');
            } else {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    // Answers change the page's height: re-measure the scroll-driven effects
    // below once the open/close has settled.
    useEffect(() => {
        const timer = window.setTimeout(() => ScrollTrigger.refresh(), 500);

        return () => window.clearTimeout(timer);
    }, [open]);

    return (
        <section className={`faq${allClear ? ' is-clear' : ''}`} aria-labelledby="faq-title">
            <SectionCircuit route={circuitRoute} />
            <div className="faq__inner">
                <div className="faq__side">
                    <div className="advisory__tag">
                        <span>[</span>FAQ<span>]</span>
                    </div>
                    <h2 id="faq-title" className="faq__title">
                        What people ask
                        <br />
                        <span className="faq__title-end">before they call.</span>
                    </h2>
                    <p className="faq__intro">
                        Straight answers to the questions we hear most. Open one and watch the doubt
                        switch off.
                    </p>

                    <div className="faq__board">
                        <p className="faq__count" aria-live="polite">
                            <span className="faq__count-dot" aria-hidden="true" />
                            {allClear ? 'All clear.' : `${cleared.length} of ${DOUBTS.length} doubts cleared`}
                        </p>
                        <ul className="faq__doubts">
                            {DOUBTS.map((doubt) => {
                                const done = cleared.some((item) => item.id === doubt.id);

                                return (
                                    <li key={doubt.id}>
                                        <button
                                            type="button"
                                            className={`faq__doubt${done ? ' is-cleared' : ''}`}
                                            onClick={() => showDoubt(doubt.id)}
                                        >
                                            <span className="faq__doubt-mark" aria-hidden="true" />
                                            <span className="faq__doubt-label">{doubt.label}</span>
                                            <span className="sr-only">{done ? ' (answered)' : ''}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                <div ref={listRef} className="faq__list">
                    {FAQS.map((faq, i) => {
                        const on = open.includes(faq.id);
                        const firstOfDoubt = FAQS.findIndex((item) => item.doubt === faq.doubt) === i;

                        return (
                            <div
                                key={faq.id}
                                className={`faq__item${on ? ' is-open' : ''}`}
                                data-doubt={firstOfDoubt ? faq.doubt : undefined}
                            >
                                <h3 className="faq__heading">
                                    <button
                                        type="button"
                                        className="faq__question"
                                        aria-expanded={on}
                                        aria-controls={`faq-${faq.id}`}
                                        id={`faq-q-${faq.id}`}
                                        onClick={() => toggle(faq.id)}
                                    >
                                        <span className="faq__switch" aria-hidden="true">
                                            <span className="faq__knob" />
                                        </span>
                                        <span className="faq__question-text">{faq.question}</span>
                                        <span className="faq__tag">
                                            {DOUBTS.find((doubt) => doubt.id === faq.doubt)?.label}
                                        </span>
                                    </button>
                                </h3>
                                <div
                                    className="faq__answer"
                                    id={`faq-${faq.id}`}
                                    role="region"
                                    aria-labelledby={`faq-q-${faq.id}`}
                                    inert={!on}
                                >
                                    <div>
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div className="faq__ask">
                        <div>
                            <p className="faq__ask-title">Still have a question?</p>
                            <p className="faq__ask-copy">Ask a person, not a form. Tell us what's on your mind and we'll answer it straight.</p>
                        </div>
                        <Link href="/contact" className="faq__ask-btn">
                            Ask us directly <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA }} />
        </section>
    );
}
