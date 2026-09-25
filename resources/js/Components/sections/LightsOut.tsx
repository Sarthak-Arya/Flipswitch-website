import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { SectionCircuit, type Layout } from '../circuit/SectionCircuit';
import { PlanDialog } from './PlanDialog';

// The building's window grid, in the drawing's coordinates (viewBox 400 x 580).
const COLS = 6;
const ROWS = 8;
const WINDOW_W = 28;
const WINDOW_H = 30;
const windowX = (col: number) => 89 + col * 38.7;
const windowY = (row: number) => 120 + row * 46;

const DURATION = 20_000;
const TICK = 50;
const BEST_KEY = 'flipswitch-lights-out-best';

const TASKS = [
    'Invoice',
    'Follow-up',
    'Data entry',
    'Copy-paste',
    'Report',
    'Reminder',
    'Timesheet',
    'Approval',
    'Reconcile',
    'Lead reply',
    'Scheduling',
    'Status update',
    'Spreadsheet',
    'Re-keying',
];

// The circuit: on from the FAQ's right margin, across the top, down the left.
const circuitRoute = ({ height, leftMargin, rightMargin }: Layout) => {
    const from = rightMargin('.faq__inner');
    const to = leftMargin('.lights__inner');

    return [
        [
            [from, 0],
            [from, 56],
            [to, 56],
            [to, height],
        ] as [number, number][],
    ];
};

type Phase = 'idle' | 'playing' | 'flip' | 'cascade' | 'done';

// A new window goes dark every 900ms at first, every 180ms by the end.
const spawnGap = (elapsed: number) => 900 - 720 * Math.pow(Math.min(1, elapsed / DURATION), 1.2);

const readBest = () => {
    try {
        return Number(window.localStorage.getItem(BEST_KEY)) || 0;
    } catch {
        return 0;
    }
};

// "Lights Out": busywork keeps switching windows of the building off; tap
// them back on for 20 seconds while it speeds up past what anyone can keep up
// with. Then the switch appears, and one flip lights every window in a blue
// cascade: that's automation. The result leads into the enquiry popup.
export function LightsOut() {
    const [phase, setPhase] = useState<Phase>('idle');
    const [dark, setDark] = useState<(string | null)[]>(() => Array(COLS * ROWS).fill(null));
    const [fixed, setFixed] = useState<number[]>([]);
    const [handled, setHandled] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [automated, setAutomated] = useState(0);
    const [best, setBest] = useState(0);
    const [asking, setAsking] = useState(false);
    const [pileUp, setPileUp] = useState(0);
    const stageRef = useRef<HTMLDivElement>(null);
    const clock = useRef({ elapsed: 0, next: 0 });
    const prefersReducedMotion = usePrefersReducedMotion();

    const darkCount = dark.filter(Boolean).length;
    const secondsLeft = Math.max(0, Math.ceil((DURATION - elapsed) / 1000));

    useEffect(() => setBest(readBest()), []);

    // The game loop: count down and switch windows off, faster and faster.
    useEffect(() => {
        if (phase !== 'playing') {
            return;
        }

        let last = performance.now();

        const timer = window.setInterval(() => {
            const now = performance.now();
            // Real time passed, capped so a stalled tab doesn't jump ahead.
            const step = Math.min(now - last, 600);
            last = now;

            // Pause while the building is off screen or the tab is hidden.
            const box = stageRef.current?.getBoundingClientRect();
            const onScreen = box && box.bottom > 0 && box.top < window.innerHeight;

            if (!onScreen || document.hidden) {
                return;
            }

            const state = clock.current;
            state.elapsed += step;
            setElapsed(state.elapsed);

            if (state.elapsed >= DURATION) {
                setPhase('flip');

                return;
            }

            if (state.elapsed < state.next) {
                return;
            }

            // Late on, two go dark at once now and then.
            const count = state.elapsed > DURATION * 0.6 && Math.random() < 0.35 ? 2 : 1;
            state.next = state.elapsed + spawnGap(state.elapsed);

            setDark((current) => {
                const next = [...current];

                for (let n = 0; n < count; n++) {
                    const lit = next.map((task, i) => (task ? -1 : i)).filter((i) => i >= 0);

                    if (!lit.length) {
                        break;
                    }

                    const pick = lit[Math.floor(Math.random() * lit.length)];
                    next[pick] = TASKS[Math.floor(Math.random() * TASKS.length)];
                }

                return next;
            });
        }, TICK);

        return () => window.clearInterval(timer);
    }, [phase]);

    const start = () => {
        clock.current = { elapsed: 0, next: 600 };
        setDark(Array(COLS * ROWS).fill(null));
        setFixed([]);
        setHandled(0);
        setElapsed(0);
        setAutomated(0);
        setPileUp(0);
        setPhase('playing');
    };

    const switchOn = (index: number) => {
        if (phase !== 'playing' || !dark[index]) {
            return;
        }

        setDark((current) => current.map((task, i) => (i === index ? null : task)));
        setHandled((n) => n + 1);
        setFixed((current) => [...current.filter((i) => i !== index), index]);
        window.setTimeout(() => setFixed((current) => current.filter((i) => i !== index)), 450);
    };

    // One flip: every dark window lights, row by row from the ground up.
    const flip = useCallback(() => {
        const remaining = dark.filter(Boolean).length;
        setPileUp(remaining);
        setPhase('cascade');

        if (handled > best) {
            setBest(handled);

            try {
                window.localStorage.setItem(BEST_KEY, String(handled));
            } catch {
                // Private mode: the best score just isn't kept.
            }
        }

        const steps = 20;
        let step = 0;
        const counter = window.setInterval(
            () => {
                step += 1;
                setAutomated(Math.round((remaining * step) / steps));

                if (step >= steps) {
                    window.clearInterval(counter);
                }
            },
            prefersReducedMotion ? 0 : 50,
        );

        window.setTimeout(
            () => {
                setDark(Array(COLS * ROWS).fill(null));
                setPhase('done');
            },
            prefersReducedMotion ? 0 : 1600,
        );
    }, [best, dark, handled, prefersReducedMotion]);

    const summary =
        pileUp > 0
            ? `You switched ${handled} back on by hand. ${pileUp} were still waiting, and one flip handled them.`
            : `You kept up with all ${handled}. Now imagine doing it all day.`;

    return (
        <section className={`lights lights--${phase}`} aria-labelledby="lights-title">
            <SectionCircuit route={circuitRoute} />
            <div className="lights__inner">
                <div className="lights__copy">
                    <div className="advisory__tag">
                        <span>[</span>PLAY<span>]</span>
                    </div>
                    <h2 id="lights-title" className="lights__title">
                        Can you keep
                        <br />
                        <span className="lights__title-end">the lights on?</span>
                    </h2>
                    <p className="lights__intro">
                        Busywork keeps switching parts of a business off. Tap a dark window to switch
                        it back on. You have 20 seconds.
                    </p>
                    {best ? <p className="lights__best">Your best: {best} by hand</p> : null}
                </div>

                <div className="lights__stage" ref={stageRef}>
                    <div className="lights__hud" aria-live="off">
                        <span>
                            <em>Time</em>
                            <strong>0:{String(phase === 'playing' ? secondsLeft : phase === 'idle' ? 20 : 0).padStart(2, '0')}</strong>
                        </span>
                        <span>
                            <em>By hand</em>
                            <strong>{handled}</strong>
                        </span>
                        <span className={darkCount > 8 ? 'is-alarm' : ''}>
                            <em>{phase === 'cascade' || phase === 'done' ? 'Automated' : 'Piling up'}</em>
                            <strong>{phase === 'cascade' || phase === 'done' ? automated : darkCount}</strong>
                        </span>
                        <span className="lights__progress" aria-hidden="true">
                            <span style={{ transform: `scaleX(${Math.min(1, elapsed / DURATION)})` }} />
                        </span>
                    </div>

                    <div className="lights__building">
                        <Building />

                        {dark.map((task, i) => {
                            const col = i % COLS;
                            const row = Math.floor(i / COLS);

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    className={`lights__window${task ? ' is-dark' : ''}${fixed.includes(i) ? ' is-fixed' : ''}`}
                                    style={
                                        {
                                            left: `${(windowX(col) / 400) * 100}%`,
                                            top: `${(windowY(row) / 580) * 100}%`,
                                            width: `${(WINDOW_W / 400) * 100}%`,
                                            height: `${(WINDOW_H / 580) * 100}%`,
                                            '--row': ROWS - 1 - row,
                                            '--col': col,
                                        } as React.CSSProperties
                                    }
                                    tabIndex={task && phase === 'playing' ? 0 : -1}
                                    aria-label={task ? `${task}: switch back on` : 'Window, lit'}
                                    disabled={phase !== 'playing'}
                                    onPointerDown={(event) => {
                                        event.preventDefault();
                                        switchOn(i);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            switchOn(i);
                                        }
                                    }}
                                >
                                    {task ? <span className="lights__task">{task}</span> : null}
                                </button>
                            );
                        })}

                        {phase === 'idle' ? (
                            <div className="lights__card">
                                <p className="lights__card-title">20 seconds. How much can you handle?</p>
                                <button type="button" className="lights__play" onClick={start}>
                                    Play <span aria-hidden="true">→</span>
                                </button>
                            </div>
                        ) : null}

                        {phase === 'flip' || phase === 'cascade' ? (
                            <div className="lights__flip">
                                <p>
                                    {phase === 'cascade'
                                        ? 'Automating…'
                                        : `${darkCount ? `${darkCount} tasks piled up.` : 'You kept up.'} Now flip the switch.`}
                                </p>
                                <button
                                    type="button"
                                    className={`lights__switch${phase === 'cascade' ? ' is-on' : ''}`}
                                    onClick={flip}
                                    disabled={phase === 'cascade'}
                                    aria-label="Flip the switch"
                                >
                                    <span className="lights__switch-knob" />
                                </button>
                            </div>
                        ) : null}

                        {phase === 'done' ? (
                            <div className="lights__card lights__card--result" aria-live="polite">
                                <p className="lights__eyebrow">Lights back on.</p>
                                <dl className="lights__score">
                                    <div>
                                        <dt>By hand</dt>
                                        <dd>{handled}</dd>
                                    </div>
                                    <div>
                                        <dt>Piled up</dt>
                                        <dd>{pileUp}</dd>
                                    </div>
                                    <div className="is-blue">
                                        <dt>One flip</dt>
                                        <dd>{pileUp}</dd>
                                    </div>
                                </dl>
                                <p className="lights__punch">
                                    Your team shouldn't spend the day switching things back on. Let's
                                    automate the busywork.
                                </p>
                                <button type="button" className="lights__play" onClick={() => setAsking(true)}>
                                    Switch off my busywork <span aria-hidden="true">→</span>
                                </button>
                                <button type="button" className="lights__again" onClick={start}>
                                    Play again
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <PlanDialog
                open={asking}
                goals={[]}
                onClose={() => setAsking(false)}
                onSent={() => undefined}
                game={{
                    summary,
                    message: `From the Lights Out game on the home page (${handled} handled by hand, ${pileUp} piled up). I'd like to find out which busywork you could automate for us.`,
                }}
            />
        </section>
    );
}

// The building, etched in fine lines: a tower with a lobby of columns, floor
// bands and pilasters, and a hatched side face in shadow. The windows are
// buttons laid over it.
function Building() {
    const floors = Array.from({ length: ROWS + 1 }, (_, r) => 112 + r * 46);
    const pilasters = Array.from({ length: COLS + 1 }, (_, c) => 84 + c * 38.7);

    return (
        <svg className="lights__drawing" viewBox="0 0 400 580" aria-hidden="true">
            <defs>
                <pattern id="lights-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-50)">
                    <path d="M0,0 V5" />
                </pattern>
                <pattern id="lights-hatch-fine" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
                    <path d="M0,0 V7" />
                </pattern>
            </defs>

            {/* Antenna and roof plant */}
            <path className="lights__line" d="M200,18 V70 M192,34 H208 M188,48 H212" />
            <rect className="lights__line" x="160" y="70" width="80" height="16" />
            <rect className="lights__hatch" x="160" y="70" width="80" height="16" fill="url(#lights-hatch-fine)" />
            <circle className="lights__beacon" cx="200" cy="16" r="3" />

            {/* Parapet and cornice */}
            <path className="lights__line" d="M66,86 H334 V100 H66 Z M72,100 H328 V108 H72 Z" />
            <path className="lights__line" d="M334,86 L364,74 V88 L334,100" />

            {/* The facade */}
            <rect className="lights__line" x="78" y="108" width="244" height="376" />
            {floors.map((y) => (
                <path key={y} className="lights__line lights__line--faint" d={`M78,${y} H322`} />
            ))}
            {pilasters.map((x) => (
                <path key={x} className="lights__line lights__line--faint" d={`M${x},108 V484`} />
            ))}

            {/* Side face in shadow */}
            <path className="lights__line" d="M322,108 L352,96 V476 L322,484" />
            <path d="M322,108 L352,96 V476 L322,484 Z" fill="url(#lights-hatch)" className="lights__hatch" />

            {/* Lobby: entablature, columns and the door */}
            <path className="lights__line" d="M70,484 H330 V496 H70 Z" />
            {[92, 136, 180, 220, 264, 308].map((x) => (
                <path key={x} className="lights__line" d={`M${x - 5},496 V546 M${x + 5},496 V546 M${x - 8},496 H${x + 8} M${x - 8},546 H${x + 8}`} />
            ))}
            <path className="lights__line" d="M188,546 V510 Q200,500 212,510 V546" />
            <path className="lights__line" d="M322,496 L352,484 V540 L322,546" />
            <path d="M322,496 L352,484 V540 L322,546 Z" fill="url(#lights-hatch)" className="lights__hatch" />

            {/* Steps and ground */}
            <path className="lights__line" d="M60,546 H342 M52,552 H350 M30,560 H380" />
            <rect x="30" y="562" width="350" height="12" fill="url(#lights-hatch-fine)" className="lights__hatch" />
        </svg>
    );
}
