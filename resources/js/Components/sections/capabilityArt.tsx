import type { ReactNode } from 'react';
import type { Capability } from '../../data/capabilities';

// Wireframe line illustrations for the capability cards, in an isometric
// style: solid-looking outlines drawn with a single stroke colour. Faces are
// filled with the card's own colour so nearer boxes hide the lines behind them.

type Box = { x: number; y: number; z: number; w: number; d: number; h: number };

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

// Isometric projection of a point, `unit` px per grid step, origin at (ox, oy).
function iso(x: number, y: number, z: number, unit: number, ox: number, oy: number) {
    return `${(ox + (x - y) * COS * unit).toFixed(1)},${(oy + (x + y) * SIN * unit - z * unit).toFixed(1)}`;
}

// The three faces of a box that face the viewer: top, left (+y) and right (+x).
function boxFaces({ x, y, z, w, d, h }: Box, unit: number, ox: number, oy: number) {
    const p = (px: number, py: number, pz: number) => iso(px, py, pz, unit, ox, oy);

    return [
        [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)],
        [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)],
        [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)],
    ];
}

function IsoBoxes({ boxes, unit, ox, oy }: { boxes: Box[]; unit: number; ox: number; oy: number }) {
    // Painter's order: the viewer looks from +x, +y, +z, so boxes with the
    // smallest centre x + y + z are furthest away and drawn first.
    const depth = (box: Box) => box.x + box.w / 2 + box.y + box.d / 2 + box.z + box.h / 2;
    const ordered = [...boxes].sort((a, b) => depth(a) - depth(b));

    return (
        <>
            {ordered.flatMap((box, i) =>
                boxFaces(box, unit, ox, oy).map((face, j) => (
                    <polygon key={`${i}-${j}`} points={face.join(' ')} />
                )),
            )}
        </>
    );
}

// A coil of stacked ellipses, like a spring: flow that keeps going.
function Coil() {
    return (
        <>
            {Array.from({ length: 11 }, (_, i) => (
                <ellipse key={i} cx="120" cy={40 + i * 9} rx="62" ry="16" fill="none" />
            ))}
        </>
    );
}

// A sphere inside a tilted ring: reaching customers on every channel.
function Orbit() {
    return (
        <>
            <ellipse cx="120" cy="104" rx="96" ry="28" fill="none" transform="rotate(-12 120 104)" />
            <circle cx="120" cy="86" r="40" />
            <ellipse cx="120" cy="86" rx="40" ry="12" fill="none" />
            {/* Front half of the ring, passing in front of the sphere. */}
            <path d="M24 104a96 28 0 0 0 192 0" fill="none" transform="rotate(-12 120 104)" />
        </>
    );
}

export const CAPABILITY_ART: Record<Capability['id'], ReactNode> = {
    // Layered platform plates.
    software: (
        <IsoBoxes
            unit={26}
            ox={120}
            oy={70}
            boxes={[
                { x: 0, y: 0, z: 0, w: 3, d: 3, h: 0.35 },
                { x: 0, y: 0, z: 1.1, w: 3, d: 3, h: 0.35 },
                { x: 0, y: 0, z: 2.2, w: 3, d: 3, h: 0.35 },
            ]}
        />
    ),
    automation: <Coil />,
    cx: <Orbit />,
    // Bars of different heights.
    data: (
        <IsoBoxes
            unit={22}
            ox={110}
            oy={96}
            boxes={[
                { x: 0, y: 0, z: 0, w: 1, d: 1, h: 1.4 },
                { x: 1.5, y: 0, z: 0, w: 1, d: 1, h: 2.6 },
                { x: 3, y: 0, z: 0, w: 1, d: 1, h: 3.8 },
            ]}
        />
    ),
    // Steps: building up, block by block.
    custom: (
        <IsoBoxes
            unit={18}
            ox={110}
            oy={52}
            boxes={[
                { x: 0, y: 0, z: 0, w: 1, d: 2, h: 3 },
                { x: 1, y: 0, z: 0, w: 1, d: 2, h: 2 },
                { x: 2, y: 0, z: 0, w: 1, d: 2, h: 1 },
            ]}
        />
    ),
    // A path of cubes winding through a 3×3×3 frame: a circuit in three
    // dimensions, reasoning its way from one corner to the other.
    ai: (
        <IsoBoxes
            unit={26}
            ox={120}
            oy={92}
            boxes={[
                [0, 0, 2], [1, 0, 2], [2, 0, 2], [2, 0, 1], [2, 1, 1],
                [2, 2, 1], [1, 2, 1], [0, 2, 1], [0, 2, 0], [1, 2, 0], [2, 2, 0],
            ].map(([x, y, z]) => ({ x, y, z, w: 1, d: 1, h: 1 }))}
        />
    ),
};
