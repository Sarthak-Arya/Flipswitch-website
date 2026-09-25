import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

// The switch that starts the page's circuit, sitting above the hero heading.
// It flips on with the first scroll (or a click) and announces it with a
// `circuit:switch` event on the advisory section, which the circuit listens for.
export function HeroSwitch() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [isOn, setIsOn] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (prefersReducedMotion) {
            setIsOn(true);

            return;
        }

        const trigger = ScrollTrigger.create({
            start: 2,
            onEnter: () => setIsOn(true),
            onLeaveBack: () => setIsOn(false),
        });

        return () => trigger.kill();
    }, [prefersReducedMotion]);

    useEffect(() => {
        rootRef.current
            ?.closest('.advisory')
            ?.dispatchEvent(new CustomEvent('circuit:switch', { detail: isOn }));
    }, [isOn]);

    return (
        <div ref={rootRef} className={`hero-switch${isOn ? ' is-on' : ''}`}>
            <button
                type="button"
                className="hero-switch__toggle"
                aria-pressed={isOn}
                onClick={() => setIsOn((on) => !on)}
            >
                <span className="hero-switch__track" aria-hidden="true">
                    <span className="hero-switch__knob" />
                </span>
                <span className="hero-switch__label">
                    {isOn ? 'Switched on' : 'Flip the switch'}
                </span>
            </button>
        </div>
    );
}
