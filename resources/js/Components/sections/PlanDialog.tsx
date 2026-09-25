import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import type { BuildGoal } from '../../data/buildGoals';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { gsap } from '../../lib/gsap';

type PlanDialogProps = {
    open: boolean;
    goals: BuildGoal[];
    onClose: () => void;
    // Called once the enquiry has been received.
    onSent: () => void;
    // Opened from the "Lights Out" game instead: its result and the message to send.
    game?: { summary: string; message: string };
};

function composeMessage(goals: BuildGoal[]) {
    if (!goals.length) {
        return "I'm not sure what to build yet, and would like help finding a starting point.";
    }

    return [
        'I want to:',
        ...goals.map((goal) => `- ${goal.label}`),
        '',
        "Where you'd start:",
        ...goals.map((goal) => `- ${goal.title}: ${goal.start}`),
    ].join('\n');
}

// The "What should we build?" enquiry: a popup over the page asking only for
// name, email and phone (with autofill hints), which submits the visitor's
// picks straight to the lead inbox and confirms in place, with no redirect.
// The "Lights Out" game reuses it with its own copy (`game`).
export function PlanDialog({ open, goals, onClose, onSent, game }: PlanDialogProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const firstFieldRef = useRef<HTMLInputElement>(null);
    const [sent, setSent] = useState(false);
    // Latest onClose, so a new function from the parent doesn't re-open the dialog.
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const prefersReducedMotion = usePrefersReducedMotion();
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        source: 'home-planner',
    });

    // Open: hold the page still behind the popup, animate in, focus the first
    // field. (Pausing ScrollSmoother would jump the page, so the overlay simply
    // swallows scrolling that starts outside the card.)
    useEffect(() => {
        if (!open) {
            return;
        }

        const opener = document.activeElement as HTMLElement | null;
        const overlay = overlayRef.current;
        const card = cardRef.current;
        const holdPage = (event: Event) => {
            if (!card?.contains(event.target as Node)) {
                event.preventDefault();
            }
        };
        overlay?.addEventListener('wheel', holdPage, { passive: false });
        overlay?.addEventListener('touchmove', holdPage, { passive: false });
        setSent(false);

        if (!prefersReducedMotion) {
            gsap.fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
            gsap.fromTo(
                cardRef.current,
                { y: 28, scale: 0.97, autoAlpha: 0 },
                { y: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: 'power3.out', delay: 0.05 },
            );
        }

        firstFieldRef.current?.focus({ preventScroll: true });

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCloseRef.current();
            }
        };
        window.addEventListener('keydown', onKey);

        return () => {
            window.removeEventListener('keydown', onKey);
            overlay?.removeEventListener('wheel', holdPage);
            overlay?.removeEventListener('touchmove', holdPage);
            opener?.focus({ preventScroll: true });
        };
    }, [open, prefersReducedMotion]);

    if (!open) {
        return null;
    }

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            message: game ? game.message : composeMessage(goals),
            source: game ? 'home-game' : 'home-planner',
        }));
        form.post('/contact', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setSent(true);
                onSent();
            },
        });
    };

    return createPortal(
        <div
            ref={overlayRef}
            className="plan-dialog"
            onMouseDown={(event) => {
                if (event.target === overlayRef.current) {
                    onClose();
                }
            }}
        >
            <div
                ref={cardRef}
                className="plan-dialog__card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="plan-dialog-title"
            >
                <button type="button" className="plan-dialog__close" onClick={onClose} aria-label="Close">
                    ×
                </button>

                {sent ? (
                    <div className="plan-dialog__done" aria-live="polite">
                        <span className="plan-dialog__check" aria-hidden="true">
                            ✓
                        </span>
                        <h3 id="plan-dialog-title" className="plan-dialog__title">
                            {game ? 'Switch flipped.' : 'Plan received.'}
                        </h3>
                        <p className="plan-dialog__lead">
                            We'll be in touch at <strong>{form.data.email}</strong>{' '}
                            {game ? 'with what we would automate first.' : "with where we'd start."}
                        </p>
                        <button type="button" className="plan-dialog__submit" onClick={onClose}>
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={submit} noValidate>
                        <p className="plan-dialog__eyebrow">{game ? 'Lights Out' : 'Your plan'}</p>
                        {game ? (
                            <p className="plan-dialog__unsure">{game.summary}</p>
                        ) : goals.length ? (
                            <ul className="plan-dialog__chips">
                                {goals.map((goal) => (
                                    <li key={goal.id}>{goal.title}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="plan-dialog__unsure">Not sure yet: we'll help you choose.</p>
                        )}

                        <h3 id="plan-dialog-title" className="plan-dialog__title">
                            {game ? 'Where should we reach you?' : 'Where should we send it?'}
                        </h3>
                        <p className="plan-dialog__lead">
                            {game
                                ? "Three details, and we'll show you which busywork we'd switch off first."
                                : "Three details, and we'll reply with a clear starting point."}
                        </p>

                        <div className="plan-dialog__fields">
                            <label className="plan-dialog__field">
                                <span>Full name</span>
                                <input
                                    ref={firstFieldRef}
                                    name="name"
                                    autoComplete="name"
                                    required
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    aria-invalid={Boolean(form.errors.name)}
                                />
                                {form.errors.name ? <em>{form.errors.name}</em> : null}
                            </label>

                            <label className="plan-dialog__field">
                                <span>Email</span>
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    inputMode="email"
                                    required
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    aria-invalid={Boolean(form.errors.email)}
                                />
                                {form.errors.email ? <em>{form.errors.email}</em> : null}
                            </label>

                            <label className="plan-dialog__field">
                                <span>Phone</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    autoComplete="tel"
                                    inputMode="tel"
                                    required
                                    value={form.data.phone}
                                    onChange={(event) => form.setData('phone', event.target.value)}
                                    aria-invalid={Boolean(form.errors.phone)}
                                />
                                {form.errors.phone ? <em>{form.errors.phone}</em> : null}
                            </label>
                        </div>

                        <button type="submit" className="plan-dialog__submit" disabled={form.processing}>
                            {form.processing ? 'Sending…' : game ? 'Flip the switch' : 'Send my plan'}{' '}
                            <span aria-hidden="true">→</span>
                        </button>
                        <p className="plan-dialog__note">We'll only use these details to reply to you.</p>
                    </form>
                )}
            </div>
        </div>,
        document.body,
    );
}
