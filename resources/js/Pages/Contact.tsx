import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import { SectionCircuit, type Layout } from '../Components/circuit/SectionCircuit';
import { GATEWAY_GROUPS, GatewayLights } from '../Components/sections/GatewayLights';
import { BUILD_GOALS } from '../data/buildGoals';
import { PAINS } from '../data/pains';
import { SITE } from '../data/site';
import { MarketingLayout } from '../Layouts/MarketingLayout';
import type { SharedPageProps } from '../types';

// Choices made on the home page start the message: problems ticked arrive as
// ?pains=id,id and things the visitor wants built as ?build=id,id.
function messageFromHomePage() {
    const params = new URLSearchParams(window.location.search);
    const ids = (name: string) => params.get(name)?.split(',') ?? [];
    const pains = PAINS.filter((pain) => ids('pains').includes(pain.id));
    const goals = BUILD_GOALS.filter((goal) => ids('build').includes(goal.id));
    const parts: string[] = [];

    if (pains.length) {
        parts.push(`These sound familiar:\n${pains.map((pain) => `- ${pain.pain}`).join('\n')}`);
    }

    if (goals.length) {
        parts.push(`I want to:\n${goals.map((goal) => `- ${goal.label}`).join('\n')}`);
    }

    return parts.length ? `${parts.join('\n\n')}\n\n` : '';
}

const NEXT_STEPS = [
    { title: 'We reply', text: 'With a few questions, or a time to talk.' },
    { title: 'One conversation', text: 'A 45-minute call to map where AI can help.' },
    { title: 'A clear plan', text: "What we'd build first, with timeline and cost." },
];

const TOTAL = GATEWAY_GROUPS.length;

// The wire: from the switch's label, out to the right margin, down past the heading
// and into the top of the form.
const circuitRoute = ({ box, rightMargin }: Layout) => {
    const from = box('.contact__switch-row');
    const card = box('.contact__card');
    const x = rightMargin('.contact__inner');
    const y = Math.round(from.cy);

    return [
        [
            [from.right + 12, y],
            [x, y],
            [x, card.top - 32],
            [card.cx, card.top - 32],
            [card.cx, card.top],
        ] as [number, number][],
    ];
};

// Contact, in the style of the home page's hero: a switch, a big heading and
// an etching, here the Gateway of India, the way in. As the visitor fills in
// the form, the Gateway lights up a part at a time (windows, turrets, the
// inscription); sending it opens the arch with light.
export default function Contact() {
    const { flash } = usePage<SharedPageProps>().props;
    const [sent, setSent] = useState(false);
    const [switchedOn, setSwitchedOn] = useState(false);
    const [aiming, setAiming] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        company: '',
        message: messageFromHomePage(),
        source: 'website',
    });

    useEffect(() => {
        const timer = window.setTimeout(() => setSwitchedOn(true), 500);

        return () => window.clearTimeout(timer);
    }, []);

    const done = {
        name: data.name.trim().length >= 2,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()),
        company: data.company.trim().length >= 2,
        message: data.message.trim().length >= 10,
    };
    const lit = sent ? TOTAL : Object.values(done).filter(Boolean).length;
    const ready = done.name && done.email && done.message;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                setSent(true);
                reset('name', 'email', 'company', 'message');
            },
        });
    }

    const status = sent
        ? 'Switched on. The way is open.'
        : lit === 0
          ? 'Fill in the form and watch the Gateway light up.'
          : ready && lit >= 3
            ? 'Ready. Send it through the gateway.'
            : `${lit} of ${TOTAL} lit`;

    return (
        <MarketingLayout>
            <Head title="Contact" />

            <section className="contact" aria-labelledby="contact-title">
                <SectionCircuit route={circuitRoute} />

                <div className="contact__inner">
                    <header className="contact__head">
                        <p className={`contact__switch-row${switchedOn ? ' is-on' : ''}`}>
                            <span className="contact__switch" aria-hidden="true">
                                <span />
                            </span>
                            Let's talk
                        </p>
                        <h1 id="contact-title" className="contact__title">
                            <span className="contact__muted">Every project starts</span>
                            <br />
                            with a conversation.
                        </h1>
                        <p className="contact__intro">
                            Tell us what you'd like to fix or build. We'll reply with a clear next
                            step, not a sales script.
                        </p>
                    </header>

                    <div className="contact__body">
                        <div className="contact__visual">
                            <GatewayLights lit={lit} open={sent} ready={aiming && ready} />
                            <p className="contact__status" aria-live="polite">
                                <span className="contact__status-dot" aria-hidden="true" />
                                {status}
                            </p>
                        </div>

                        <div className="contact__card">
                            {sent ? (
                                <div className="contact__done" role="status">
                                    <span className="contact__check" aria-hidden="true">
                                        ✓
                                    </span>
                                    <h2 className="contact__card-title">Switched on.</h2>
                                    <p>{flash?.success ?? 'Thanks. We will review your message and get back to you.'}</p>
                                    <button type="button" className="contact__again" onClick={() => setSent(false)}>
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={submit} noValidate>
                                    <div className="contact__card-head">
                                        <div>
                                            <p className="contact__eyebrow">Your message</p>
                                            <h2 className="contact__card-title">What would you like to switch on?</h2>
                                        </div>
                                        {/* Phones: a small Gateway beside the form, so the lights stay in view. */}
                                        <GatewayLights lit={lit} ready={aiming && ready} className="gateway--mini" />
                                    </div>

                                    <div className="contact__fields">
                                        <Field
                                            label="Your name"
                                            done={done.name}
                                            error={errors.name}
                                            input={
                                                <input
                                                    name="name"
                                                    autoComplete="name"
                                                    value={data.name}
                                                    onChange={(event) => setData('name', event.target.value)}
                                                    aria-invalid={Boolean(errors.name)}
                                                />
                                            }
                                        />
                                        <Field
                                            label="Work email"
                                            done={done.email}
                                            error={errors.email}
                                            input={
                                                <input
                                                    type="email"
                                                    name="email"
                                                    autoComplete="email"
                                                    inputMode="email"
                                                    value={data.email}
                                                    onChange={(event) => setData('email', event.target.value)}
                                                    aria-invalid={Boolean(errors.email)}
                                                />
                                            }
                                        />
                                        <Field
                                            label="Company"
                                            hint="Optional"
                                            done={done.company}
                                            error={errors.company}
                                            wide
                                            input={
                                                <input
                                                    name="company"
                                                    autoComplete="organization"
                                                    value={data.company}
                                                    onChange={(event) => setData('company', event.target.value)}
                                                    aria-invalid={Boolean(errors.company)}
                                                />
                                            }
                                        />
                                        <Field
                                            label="What's slowing you down, or what would you like to build?"
                                            done={done.message}
                                            error={errors.message}
                                            wide
                                            input={
                                                <textarea
                                                    name="message"
                                                    rows={5}
                                                    placeholder="E.g. our team spends hours every week copying data between the CRM and spreadsheets…"
                                                    value={data.message}
                                                    onChange={(event) => setData('message', event.target.value)}
                                                    aria-invalid={Boolean(errors.message)}
                                                />
                                            }
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className={`contact__send${ready ? ' is-ready' : ''}`}
                                        disabled={processing}
                                        onPointerEnter={() => setAiming(true)}
                                        onPointerLeave={() => setAiming(false)}
                                        onFocus={() => setAiming(true)}
                                        onBlur={() => setAiming(false)}
                                    >
                                        {processing ? 'Sending…' : 'Send it through'} <span aria-hidden="true">→</span>
                                    </button>
                                    <p className="contact__note">We'll only use these details to reply to you.</p>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="contact__after">
                        <div>
                            <p className="contact__eyebrow">What happens next</p>
                            <ol className="contact__steps">
                                {NEXT_STEPS.map((step, i) => (
                                    <li key={step.title}>
                                        <span>0{i + 1}</span>
                                        <strong>{step.title}</strong>
                                        <p>{step.text}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="contact__direct">
                            <p className="contact__eyebrow">Prefer email?</p>
                            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                            <p>{SITE.location}</p>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}

type FieldProps = {
    label: string;
    hint?: string;
    done: boolean;
    error?: string;
    wide?: boolean;
    input: React.ReactNode;
};

// A field whose small switch flips on once it's filled in.
function Field({ label, hint, done, error, wide = false, input }: FieldProps) {
    return (
        <label className={`contact__field${wide ? ' is-wide' : ''}${done ? ' is-done' : ''}`}>
            <span className="contact__label">
                <span className="contact__field-switch" aria-hidden="true">
                    <span />
                </span>
                {label}
                {hint ? <em>{hint}</em> : null}
            </span>
            {input}
            {error ? <span className="contact__error">{error}</span> : null}
        </label>
    );
}
