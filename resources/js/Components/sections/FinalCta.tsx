import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { SectionCircuit, type Layout } from '../circuit/SectionCircuit';

// In from the left rail of "Lights Out", across the top and down into the
// switch. (The footer draws the branch that carries on down the margin.)
const route = ({ box, leftMargin }: Layout) => {
    const x = leftMargin('.lights__inner');
    const target = box('.final__switch');

    return [
        [
            [x, 0],
            [x, 56],
            [target.cx, 56],
            [target.cx, target.top],
        ],
    ] as [number, number][][];
};

// The page's last word, where the circuit ends. When the current arrives the
// switch flips on (a bookend to the hero's switch), "flip the switch?"
// flickers on for a few seconds so it is noticed, and the button starts to glow.
export function FinalCta() {
    const [powered, setPowered] = useState(false);

    return (
        <section id="advisory-contact" className={`advisory__cta final${powered ? ' is-powered' : ''}`}>
            <SectionCircuit route={route} onEnd={setPowered} finishAtBottom />

            <span className="final__switch" aria-hidden="true">
                <span className="final__knob" />
            </span>

            <h3 className="advisory__display advisory__display--cta">
                <span className="advisory__muted">Ready to</span>
                <br />
                <span className="final__flip">flip the switch?</span>
            </h3>
            <p className="advisory__intro-copy advisory__cta-copy">
                One 45-minute call with a partner. You'll leave knowing where AI can give your team
                hours back, and what to switch on first.
            </p>
            <Link href="/contact" className="advisory__btn advisory__btn--cta final__btn">
                Book your call <span aria-hidden="true">→</span>
            </Link>
            <p className="final__note">45 minutes · One partner · A clear next step</p>
        </section>
    );
}
