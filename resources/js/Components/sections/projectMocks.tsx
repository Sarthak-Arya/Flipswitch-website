import type { ReactNode } from 'react';
import { gsap } from '../../lib/gsap';
import type { Project } from '../../data/projects';

// Coded mock-ups of each project's key moment, shown in the card until a real
// video loop is added. Demo content only (names, messages and numbers are
// illustrative). Each has a looping GSAP timeline, played while on screen.

const VoiceMock = (
    <div className="mock mock--voice">
        <div className="mock__bar">
            <span className="mock__live" /> Live call · 2:14 AM
            <span className="mock-voice__wave" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => (
                    <i key={i} />
                ))}
            </span>
        </div>
        <p className="mock-bubble mock-bubble--in">Hi, can I book a viewing for Saturday?</p>
        <span className="mock-chip">Intent detected: booking</span>
        <p className="mock-bubble mock-bubble--out">Of course. Does 11am or 2pm suit you?</p>
        <div className="mock-record">
            <span className="mock-record__check">✓</span>
            <span>
                CRM updated <em>Viewing · Sat 11:00</em>
            </span>
        </div>
    </div>
);

const CrmMock = (
    <div className="mock mock--crm">
        <div className="mock__bar">Leads · Marina office</div>
        <div className="mock-crm__board">
            {['New', 'Contacted', 'Viewing'].map((column) => (
                <div key={column} className="mock-crm__col">
                    <span className="mock-crm__label">{column}</span>
                    <span className="mock-crm__ghost" />
                    <span className="mock-crm__ghost mock-crm__ghost--short" />
                </div>
            ))}
            <div className="mock-crm__lead">
                <strong>Aisha K.</strong>
                <span>3-bed · Marina</span>
            </div>
        </div>
        <div className="mock-toast">
            <span className="mock-record__check">✓</span> AI follow-up sent
        </div>
    </div>
);

const WhatsAppMock = (
    <div className="mock mock--whatsapp">
        <div className="mock__bar">Customer inbox · 3 agents online</div>
        <p className="mock-bubble mock-bubble--in">Is the blue one back in stock?</p>
        <span className="mock-typing" aria-hidden="true">
            <i />
            <i />
            <i />
        </span>
        <p className="mock-bubble mock-bubble--out mock-bubble--wa">
            Yes! Want me to reserve one for you?
            <small>Replied in 2s</small>
        </p>
        <div className="mock-record">
            <span className="mock-record__check">✓</span>
            <span>
                Campaign delivered <em className="mock-count">0</em>
            </span>
        </div>
    </div>
);

export const PROJECT_MOCKS: Record<Project['id'], ReactNode> = {
    voice: VoiceMock,
    crm: CrmMock,
    whatsapp: WhatsAppMock,
};

const pop = { autoAlpha: 0, y: 8, duration: 0.35, ease: 'power2.out' };

export type MockPlayer = {
    play: () => void;
    pause: () => void;
    // Show the finished moment without animating (for reduced motion).
    still: () => void;
    kill: () => void;
};

// Controls a mock-up's looping animation inside `root`; starts paused.
export function mockPlayer(id: Project['id'], root: HTMLElement): MockPlayer {
    const q = gsap.utils.selector(root);
    const timeline = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.4 });
    const extras: gsap.core.Animation[] = [];

    if (id === 'voice') {
        const wave = gsap.to(q('.mock-voice__wave i'), {
            scaleY: () => gsap.utils.random(0.25, 1),
            duration: 0.18,
            ease: 'none',
            repeat: -1,
            repeatRefresh: true,
            stagger: { each: 0.03, from: 'center' },
            paused: true,
        });
        extras.push(wave);
        timeline
            .from(q('.mock-bubble--in'), pop)
            .from(q('.mock-chip'), { ...pop, scale: 0.8 }, '+=0.5')
            .from(q('.mock-bubble--out'), pop, '+=0.4')
            .from(q('.mock-record'), { ...pop, x: -10, y: 0 }, '+=0.5')
            .to({}, { duration: 2.2 });
    }

    if (id === 'crm') {
        const lead = q('.mock-crm__lead')[0] as HTMLElement;
        const column = q('.mock-crm__col')[0] as HTMLElement;
        const step = () => column.offsetWidth + 6;

        timeline
            .fromTo(lead, { x: 0, autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 })
            .to(lead, { x: step, duration: 0.7, ease: 'power3.inOut' }, '+=0.8')
            .to(lead, { x: () => step() * 2, duration: 0.7, ease: 'power3.inOut' }, '+=0.9')
            .from(q('.mock-toast'), { ...pop, y: 12 }, '+=0.2')
            .to({}, { duration: 2 });
    }

    if (id === 'whatsapp') {
        const count = q('.mock-count')[0] as HTMLElement;
        const counter = { value: 0 };

        timeline
            .from(q('.mock-bubble--in'), pop)
            .from(q('.mock-typing'), { autoAlpha: 0, duration: 0.2 }, '+=0.3')
            .to(q('.mock-typing i'), { y: -3, duration: 0.2, yoyo: true, repeat: 3, stagger: 0.08 })
            .to(q('.mock-typing'), { autoAlpha: 0, duration: 0.15 })
            .from(q('.mock-bubble--out'), pop)
            .from(q('.mock-record'), { ...pop, x: -10, y: 0 }, '+=0.4')
            .fromTo(
                counter,
                { value: 0 },
                {
                    value: 1204,
                    duration: 1.2,
                    ease: 'power2.out',
                    onUpdate: () => {
                        count.textContent = Math.round(counter.value).toLocaleString('en-US');
                    },
                },
            )
            .to({}, { duration: 2 });
    }

    const all = [timeline, ...extras];

    return {
        play: () => all.forEach((animation) => animation.play()),
        pause: () => all.forEach((animation) => animation.pause()),
        still: () => {
            timeline.progress(0.9).pause();
        },
        kill: () => all.forEach((animation) => animation.revert()),
    };
}
