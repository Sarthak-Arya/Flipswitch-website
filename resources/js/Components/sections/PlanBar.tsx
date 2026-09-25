import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TOWER_HEIGHT, TOWER_LIGHTS, TOWER_WIDTH } from '../../data/towerLights';
import { TowerLights } from './TowerLights';

type PlanBarProps = {
    visible: boolean;
    lit: number;
    onTalk: () => void;
};

// Phones only: a bar docked to the bottom of the screen while the visitor is
// choosing, so the tower's lights respond right where they tap. A mini tower
// lights with each pick (with a "+1 level" pulse), and the button is always in
// reach. Rendered into <body> so it stays fixed while the page scrolls.
export function PlanBar({ visible, lit, onTalk }: PlanBarProps) {
    const [pulse, setPulse] = useState(0);
    const previous = useRef(lit);
    const total = TOWER_LIGHTS.length;

    // A new level: replay the pulse (the key change restarts the animation).
    useEffect(() => {
        if (lit > previous.current) {
            setPulse((n) => n + 1);
        }

        previous.current = lit;
    }, [lit]);

    return createPortal(
        <div className={`plan-bar${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
            <div key={pulse} className={`plan-bar__tower${pulse ? ' is-pulsing' : ''}`}>
                <img src="/images/eiffel.webp" alt="" width={TOWER_WIDTH} height={TOWER_HEIGHT} />
                <TowerLights lit={lit} radius={15} className="plan-bar__lights" />
                {pulse ? <span className="plan-bar__plus">+1 level</span> : null}
            </div>

            <p className="plan-bar__meter" aria-live="polite">
                {lit === 0 ? (
                    <>
                        <strong>Tap to light the tower</strong>
                        <span>Each pick switches on a level</span>
                    </>
                ) : (
                    <>
                        <strong>
                            {lit} of {total} lit
                        </strong>
                        <span>{lit >= total ? 'Fully lit' : 'Keep picking, or talk to us'}</span>
                    </>
                )}
            </p>

            <button type="button" className="plan-bar__cta" onClick={onTalk} tabIndex={visible ? 0 : -1}>
                Talk to us <span aria-hidden="true">→</span>
            </button>
        </div>,
        document.body,
    );
}
