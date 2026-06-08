import type { ReactElement } from 'react';

export type ProblemVisualVariant =
    | 'stack'
    | 'sphere'
    | 'cubes'
    | 'lattice'
    | 'ring'
    | 'helix';

type ProblemCardVisualProps = {
    variant: ProblemVisualVariant;
};

const STROKE = '#7a8fb8';
const STROKE_LIGHT = 'rgba(122, 143, 184, 0.45)';

function VisualStack() {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M38 118 L100 82 L162 118 L100 154 Z" stroke={STROKE} strokeWidth="1.2" />
            <path d="M38 118 L38 88 L100 52 L100 82" stroke={STROKE} strokeWidth="1.2" />
            <path d="M100 82 L162 118 L162 88 L100 52" stroke={STROKE_LIGHT} strokeWidth="1" />
            <path d="M52 104 L100 76 L148 104 L100 132 Z" stroke={STROKE} strokeWidth="1.2" />
            <path d="M52 104 L52 78 L100 50 L100 76" stroke={STROKE} strokeWidth="1.2" />
            <path d="M100 76 L148 104 L148 78 L100 50" stroke={STROKE_LIGHT} strokeWidth="1" />
            <path d="M66 90 L100 68 L134 90 L100 112 Z" stroke={STROKE} strokeWidth="1.2" />
            <path d="M66 90 L66 70 L100 48 L100 68" stroke={STROKE} strokeWidth="1.2" />
            <path d="M100 68 L134 90 L134 70 L100 48" stroke={STROKE_LIGHT} strokeWidth="1" />
        </svg>
    );
}

function VisualSphere() {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="100" cy="138" rx="52" ry="14" stroke={STROKE_LIGHT} strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="54" ry="54" stroke={STROKE} strokeWidth="1.2" />
            <ellipse cx="100" cy="100" rx="54" ry="54" stroke={STROKE_LIGHT} strokeWidth="0.8" strokeDasharray="4 6" />
            <path d="M46 100 Q100 46 154 100" stroke={STROKE} strokeWidth="1" />
            <path d="M46 100 Q100 154 154 100" stroke={STROKE_LIGHT} strokeWidth="1" />
            <ellipse cx="100" cy="88" rx="38" ry="10" stroke={STROKE_LIGHT} strokeWidth="0.9" />
        </svg>
    );
}

function VisualCubes() {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M72 112 L100 96 L128 112 L100 128 Z" stroke={STROKE} strokeWidth="1.3" />
            <path d="M72 112 L72 84 L100 68 L100 96" stroke={STROKE} strokeWidth="1.3" />
            <path d="M100 96 L128 112 L128 84 L100 68" stroke={STROKE_LIGHT} strokeWidth="1.1" />
            <path d="M108 88 L136 104 L164 88 L136 72 Z" stroke={STROKE} strokeWidth="1.2" />
            <path d="M108 88 L108 60 L136 44 L136 72" stroke={STROKE} strokeWidth="1.2" />
            <path d="M136 72 L164 88 L164 60 L136 44" stroke={STROKE_LIGHT} strokeWidth="1" />
            <path d="M36 104 L64 120 L92 104 L64 88 Z" stroke={STROKE} strokeWidth="1.2" />
            <path d="M36 104 L36 76 L64 60 L64 88" stroke={STROKE} strokeWidth="1.2" />
            <path d="M64 88 L92 104 L92 76 L64 60" stroke={STROKE_LIGHT} strokeWidth="1" />
            <path d="M88 128 L116 144 L144 128 L116 112 Z" stroke={STROKE_LIGHT} strokeWidth="1.1" />
            <path d="M88 128 L88 100 L116 84 L116 112" stroke={STROKE_LIGHT} strokeWidth="1" />
        </svg>
    );
}

function VisualLattice() {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {[0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => {
                    const x = 44 + col * 38;
                    const y = 52 + row * 36;
                    return (
                        <g key={`${row}-${col}`}>
                            <path
                                d={`M${x} ${y + 20} L${x + 19} ${y + 10} L${x + 38} ${y + 20} L${x + 19} ${y + 30} Z`}
                                stroke={STROKE}
                                strokeWidth="1.1"
                            />
                            <path
                                d={`M${x} ${y + 20} L${x} ${y} L${x + 19} ${y - 10} L${x + 19} ${y + 10}`}
                                stroke={STROKE}
                                strokeWidth="1.1"
                            />
                            <path
                                d={`M${x + 19} ${y + 10} L${x + 38} ${y + 20} L${x + 38} ${y} L${x + 19} ${y - 10}`}
                                stroke={STROKE_LIGHT}
                                strokeWidth="0.9"
                            />
                        </g>
                    );
                }),
            )}
        </svg>
    );
}

function VisualRing() {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="100" cy="100" rx="62" ry="28" stroke={STROKE} strokeWidth="1.3" />
            <ellipse cx="100" cy="100" rx="42" ry="18" stroke={STROKE_LIGHT} strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="62" ry="28" stroke={STROKE_LIGHT} strokeWidth="0.9" transform="rotate(58 100 100)" />
            <ellipse cx="100" cy="100" rx="48" ry="22" stroke={STROKE} strokeWidth="1.1" transform="rotate(-32 100 100)" />
        </svg>
    );
}

function VisualHelix() {
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M100 36 C124 52 124 76 100 92 C76 108 76 132 100 148 C124 164 124 188 100 204"
                stroke={STROKE}
                strokeWidth="1.2"
                transform="translate(0 -18)"
            />
            <path
                d="M88 48 C72 60 72 80 88 92 C104 104 104 124 88 136"
                stroke={STROKE_LIGHT}
                strokeWidth="1"
                transform="translate(6 -10)"
            />
            <path
                d="M112 56 C128 68 128 88 112 100 C96 112 96 132 112 144"
                stroke={STROKE_LIGHT}
                strokeWidth="1"
                transform="translate(-6 -6)"
            />
            {Array.from({ length: 14 }).map((_, index) => {
                const y = 42 + index * 9;
                const x = 100 + Math.sin(index * 0.85) * 22;
                return <circle key={index} cx={x} cy={y} r="2.2" stroke={STROKE} strokeWidth="1" fill="none" />;
            })}
        </svg>
    );
}

const VISUALS = {
    stack: VisualStack,
    sphere: VisualSphere,
    cubes: VisualCubes,
    lattice: VisualLattice,
    ring: VisualRing,
    helix: VisualHelix,
} satisfies Record<ProblemVisualVariant, () => ReactElement>;

export function ProblemCardVisual({ variant }: ProblemCardVisualProps) {
    const Visual = VISUALS[variant];

    return (
        <div className="problem-section__card-art" aria-hidden="true">
            <Visual />
        </div>
    );
}
