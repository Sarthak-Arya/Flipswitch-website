// The Gateway of India (public/images/gateway.webp), with lights laid under
// the drawing: the image is multiplied over them, so they glow through the
// glass and openings while the etched lines stay on top.
export const GATEWAY_WIDTH = 766;
export const GATEWAY_HEIGHT = 676;

// A window with a round-arched top.
const arched = (x0: number, y0: number, x1: number, y1: number) => {
    const r = (x1 - x0) / 2;

    return `M${x0},${y1} V${y0 + r} A${r},${r} 0 0 1 ${x1},${y0 + r} V${y1} Z`;
};

const rect = (x0: number, y0: number, x1: number, y1: number) => `M${x0},${y0} H${x1} V${y1} H${x0} Z`;

const turretWindows = [193, 207, 221, 553, 567, 581].flatMap((x) =>
    [106, 152].map((y) => arched(x - 4, y - 9, x + 4, y + 8)),
);

// Lit one group per completed field, from the ground up; the arch opens last.
export const GATEWAY_GROUPS = [
    // Name: the lower windows.
    [arched(110, 496, 152, 600), arched(623, 496, 662, 600)],
    // Email: the upper windows.
    [arched(106, 392, 158, 462), arched(615, 392, 667, 462)],
    // Company: the turrets and the parapet.
    [...turretWindows, arched(240, 132, 248, 148), arched(525, 132, 533, 148), rect(238, 160, 536, 180)],
    // Message: the inscription panel.
    [rect(253, 210, 525, 252)],
];

const ARCH = 'M312,665 V520 C314,490 340,458 389,432 C438,458 464,490 466,520 V665 Z';

type GatewayLightsProps = {
    // How many groups are lit (0 to 4).
    lit: number;
    // The message has been sent: the arch opens with light.
    open?: boolean;
    // About to send: the arch glows faintly.
    ready?: boolean;
    className?: string;
};

export function GatewayLights({ lit, open = false, ready = false, className = '' }: GatewayLightsProps) {
    return (
        <div className={`gateway ${className}${open ? ' is-open' : ''}${ready ? ' is-ready' : ''}`}>
            <svg className="gateway__lights" viewBox={`0 0 ${GATEWAY_WIDTH} ${GATEWAY_HEIGHT}`} aria-hidden="true">
                <defs>
                    <radialGradient id="gateway-glow" cx="50%" cy="45%" r="65%">
                        <stop offset="0%" stopColor="#dbe7fb" />
                        <stop offset="55%" stopColor="#6292e3" />
                        <stop offset="100%" stopColor="#1356c9" />
                    </radialGradient>
                    <filter id="gateway-halo" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="10" />
                    </filter>
                </defs>

                {GATEWAY_GROUPS.map((group, i) => (
                    <g key={i} className={`gateway__group${i < lit ? ' is-on' : ''}`}>
                        {group.map((d, j) => (
                            <g key={j}>
                                <path className="gateway__halo" d={d} />
                                <path className="gateway__glass" d={d} />
                            </g>
                        ))}
                    </g>
                ))}

                <g className="gateway__arch">
                    <path className="gateway__halo" d={ARCH} />
                    <path className="gateway__glass" d={ARCH} />
                </g>
            </svg>
            <img src="/images/gateway.webp" alt="" width={GATEWAY_WIDTH * 2} height={GATEWAY_HEIGHT * 2} />
        </div>
    );
}
