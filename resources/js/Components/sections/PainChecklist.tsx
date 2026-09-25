import { Link } from '@inertiajs/react';
import { PAINS } from '../../data/pains';
import { PainCircuit } from '../circuit/PainCircuit';

function ctaLabel(count: number) {
    if (count === 0) {
        return 'Talk to an expert';
    }

    return count === 1 ? 'Talk to an expert about this' : `Talk to an expert about these ${count}`;
}

type PainChecklistProps = {
    ticked: string[];
    onToggle: (id: string) => void;
};

// "If your business looks like this, we should talk": the visitor flips a
// switch on each problem they recognise, which reveals what we'd build for it
// and taps that row into the circuit. With anything ticked, the circuit reaches
// the button, which carries the ticked problems to the contact form. The ticked
// list lives in the parent so "What we build" can respond to it.
export function PainChecklist({ ticked, onToggle: toggle }: PainChecklistProps) {
    const selected = PAINS.filter((pain) => ticked.includes(pain.id)).map((pain) => pain.id);
    const href = selected.length ? `/contact?pains=${selected.join(',')}` : '/contact';

    return (
        <section className="pain" aria-labelledby="pain-title">
            <PainCircuit />

            <div className="pain__head">
                <div className="advisory__tag">
                    <span>[</span>SOUND FAMILIAR?<span>]</span>
                </div>
                <h2 id="pain-title" className="pain__title">
                    If your business looks like this, we should talk.
                </h2>
                <p className="pain__hint">Tick what sounds familiar.</p>
            </div>

            <ul className="pain__list">
                {PAINS.map((item) => {
                    const on = ticked.includes(item.id);

                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                className={`pain__row${on ? ' is-on' : ''}`}
                                aria-pressed={on}
                                onClick={() => toggle(item.id)}
                            >
                                <span className="pain__switch" aria-hidden="true">
                                    <span className="pain__knob" />
                                </span>
                                <span className="pain__text">{item.pain}</span>
                                <span className="pain__build">
                                    <span className="pain__build-label">We'd build</span>
                                    {item.build}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="pain__close">
                <p className="pain__closing">We turn these problems into systems.</p>
                <Link href={href} className={`pain__cta${selected.length ? ' is-live' : ''}`}>
                    {ctaLabel(selected.length)} <span aria-hidden="true">→</span>
                </Link>
            </div>
        </section>
    );
}
