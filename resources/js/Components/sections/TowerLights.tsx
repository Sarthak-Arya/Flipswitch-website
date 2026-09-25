import { TOWER_HEIGHT, TOWER_LIGHTS, TOWER_WIDTH } from '../../data/towerLights';

// Twinkle offsets for the lights, fixed so renders are stable.
const twinkle = (band: number, i: number) => `${((band * 7 + i * 13) % 20) / 10}s`;

type TowerLightsProps = {
    // How many bands are lit, from the feet up.
    lit: number;
    // Light radius in image pixels (larger for the small tower, so it reads).
    radius?: number;
    className?: string;
};

// The Eiffel Tower's lights, laid over public/images/eiffel.webp.
export function TowerLights({ lit, radius = 3.2, className = 'plan__lights' }: TowerLightsProps) {
    return (
        <svg className={className} viewBox={`0 0 ${TOWER_WIDTH} ${TOWER_HEIGHT}`} aria-hidden="true">
            {TOWER_LIGHTS.map((band, b) => (
                <g
                    key={b}
                    className={`plan__band${b < lit ? ' is-on' : ''}`}
                    style={{ '--band': b } as React.CSSProperties}
                >
                    {band.map(([x, y], i) => (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r={radius}
                            style={{ '--delay': twinkle(b, i) } as React.CSSProperties}
                        />
                    ))}
                </g>
            ))}
        </svg>
    );
}
