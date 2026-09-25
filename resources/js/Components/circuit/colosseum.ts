// Geometry for the Colosseum etching (public/images/etching.webp), in the
// image's own pixels. Drives the blueprint that "rebuilds" the ruined outer
// wall and the lights that chase through every arch.

export const IMAGE_WIDTH = 1376;
export const IMAGE_HEIGHT = 768;

// ─── Outer wall model ────────────────────────────────────────
// The wall is an ellipse seen in perspective from near ground level. θ runs
// around it (0 = nearest the viewer); these constants were fitted to the
// spacing of the tower's arches and to its measured heights.

const CENTRE_X = 685.8;
const SPREAD = 467.4;
const DEPTH = 0.3143; // perspective strength (0 = flat)
const FIRST_BAY = -0.9737; // θ of the tower's leftmost bay centre
const BAY = 0.1329; // θ per bay
const WALL_END = 1.251; // θ where the wall turns out of view (both sides)
const HORIZON = 604.6;
const EYE = 0.1244; // eye height as a fraction of the wall's height

// Heights on the wall, as fractions from the ground (tower measurements).
const TIER3_BASE = 0.449;
const TIER3_PLINTH = 0.47;
const TIER3_SILL = 0.516;
const TIER3_CROWN = 0.65;
const TIER3_TOP = 0.675;
const ATTIC_BASE = 0.703;
const ATTIC_COURSES = [0.77, 0.84, 0.91];
const CORBEL_TOP = 0.935;
const CORBEL_BOTTOM = 0.958;
const ATTIC_TOP = 0.965;
const BALUSTRADE = 0.49;

const wallX = (th: number) => CENTRE_X + (SPREAD * Math.sin(th)) / (1 - DEPTH * Math.cos(th));

function thetaAtX(x: number) {
    let lo = -WALL_END;
    let hi = WALL_END;

    for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2;

        if (wallX(mid) < x) {
            lo = mid;
        } else {
            hi = mid;
        }
    }

    return (lo + hi) / 2;
}

// The tower's peak, where the surviving wall stops and the blueprint begins.
const RUIN_START = thetaAtX(440);
const HEIGHT_SCALE = 630 * (1 - DEPTH * Math.cos(RUIN_START));

const wallHeight = (th: number) => HEIGHT_SCALE / (1 - DEPTH * Math.cos(th));
const wallY = (th: number, fraction: number) =>
    HORIZON + (EYE - fraction) * wallHeight(th);

// Top edge of the surviving (ruined) structure from x = 440 to 1172, every 4px.
const RUIN_EDGE = [
    53, 57, 61, 66, 77, 80, 82, 86, 91, 96, 102, 115, 126, 136, 147, 157,
    167, 177, 187, 189, 188, 188, 188, 189, 193, 199, 206, 279, 283, 297, 310, 323,
    334, 344, 343, 343, 343, 343, 342, 342, 342, 341, 341, 341, 340, 340, 340, 347,
    348, 361, 372, 372, 377, 379, 379, 379, 379, 379, 379, 379, 378, 378, 378, 378,
    359, 358, 358, 358, 358, 358, 358, 358, 358, 358, 358, 361, 371, 371, 371, 358,
    352, 351, 351, 351, 351, 352, 351, 351, 352, 352, 352, 352, 352, 352, 352, 352,
    353, 353, 353, 353, 354, 354, 355, 355, 355, 356, 356, 357, 357, 357, 358, 358,
    360, 360, 361, 361, 361, 362, 362, 363, 363, 364, 364, 365, 365, 366, 366, 367,
    367, 367, 368, 369, 369, 370, 370, 371, 372, 372, 373, 374, 374, 375, 376, 376,
    377, 377, 378, 379, 380, 381, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390,
    391, 392, 393, 394, 395, 397, 398, 399, 401, 402, 403, 405, 407, 408, 410, 412,
    414, 417, 419, 423, 426, 429, 433, 437,
];
const RUIN_EDGE_START = 440;
const RUIN_EDGE_STEP = 4;
const RUIN_EDGE_END_Y = RUIN_EDGE[RUIN_EDGE.length - 1];

// ─── Path helpers ────────────────────────────────────────────

const n = (value: number) => value.toFixed(1);

function alongWall(fraction: number, from = RUIN_START, to = WALL_END, steps = 72) {
    const points = Array.from({ length: steps + 1 }, (_, i) => {
        const th = from + ((to - from) * i) / steps;

        return `${n(wallX(th))},${n(wallY(th, fraction))}`;
    });

    return `M${points.join(' L')}`;
}

const verticalLine = (x: number, y1: number, y2: number) => `M${n(x)},${n(y1)} V${n(y2)}`;

// An arch opening; `closed` for a filled light, open for a drawn outline.
function archPath(x: number, bottom: number, width: number, top: number, closed: boolean) {
    const r = Math.min(width / 2, (bottom - top) / 2);
    const spring = top + r;
    const outline = `M${n(x)},${n(bottom)} V${n(spring)} A${n(r)},${n(r)} 0 0 1 ${n(x + width)},${n(spring)} V${n(bottom)}`;

    return closed ? `${outline} Z` : outline;
}

const rectPath = (x: number, y: number, w: number, h: number) =>
    `M${n(x)},${n(y)} h${n(w)} v${n(h)} h${n(-w)} Z`;

const horizontalLine = (x1: number, x2: number, y: number) => `M${n(x1)},${n(y)} H${n(x2)}`;

// Just the curve of an arch, from springing to springing.
function arcPath(x: number, spring: number, width: number) {
    const r = width / 2;

    return `M${n(x)},${n(spring)} A${n(r)},${n(r)} 0 0 1 ${n(x + width)},${n(spring)}`;
}

// ─── Blueprint of the missing wall ───────────────────────────

const rightEndX = wallX(WALL_END);

const ruinEdgeBackwards = RUIN_EDGE.map(
    (y, i) => `${RUIN_EDGE_START + i * RUIN_EDGE_STEP},${y}`,
).reverse();

type Stroke = { d: string; x: number };

const pilasters: Stroke[] = [];
const openings: Stroke[] = [];
const details: Stroke[] = [];
const blueprintLights: { d: string; x: number }[] = [];

for (let bay = 0; FIRST_BAY + bay * BAY < WALL_END; bay++) {
    const centre = FIRST_BAY + bay * BAY;
    const left = centre - BAY / 2;
    const right = centre + BAY / 2;
    const cx = wallX(centre);

    // Column at the bay's left edge: pedestal in the balustrade band, a shaft
    // with base and capital in tier 3, and a flat pilaster through the attic.
    if (left > RUIN_START && left < WALL_END) {
        const x = wallX(left);
        const half = 0.035 * (wallX(Math.min(right, WALL_END)) - x);
        const sillY = wallY(left, TIER3_SILL);
        const capitalY = wallY(left, TIER3_TOP - 0.014);

        for (const offset of [-half, half]) {
            pilasters.push({ d: verticalLine(x + offset, sillY, wallY(left, TIER3_TOP)), x });
            pilasters.push({ d: verticalLine(x + offset, wallY(left, ATTIC_BASE), wallY(left, ATTIC_TOP)), x });
        }

        pilasters.push({ d: rectPath(x - half * 1.5, sillY, half * 3, wallY(left, TIER3_PLINTH) - sillY), x });
        pilasters.push({ d: horizontalLine(x - half * 1.6, x + half * 1.6, capitalY), x });
        pilasters.push({ d: horizontalLine(x - half * 1.4, x + half * 1.4, sillY - 0.006 * wallHeight(left)), x });
    }

    if (right > WALL_END || cx < 540) {
        continue;
    }

    const pitch = wallX(right) - wallX(left);

    // Tier-3 arch with its outer ring, keystone and impost ledges.
    const archWidth = 0.45 * pitch;
    const ring = 0.06 * pitch;
    const archLeft = cx - archWidth / 2;
    const sill = wallY(centre, TIER3_SILL);
    const crown = wallY(centre, TIER3_CROWN);
    const spring = crown + archWidth / 2;

    openings.push({ d: archPath(archLeft, sill, archWidth, crown, false), x: cx });
    openings.push({ d: arcPath(archLeft - ring, spring, archWidth + ring * 2), x: cx });
    openings.push({ d: rectPath(cx - ring * 0.45, crown - ring * 1.15, ring * 0.9, ring * 1.15), x: cx });
    openings.push({ d: horizontalLine(archLeft - ring * 1.7, archLeft, spring), x: cx });
    openings.push({ d: horizontalLine(archLeft + archWidth, archLeft + archWidth + ring * 1.7, spring), x: cx });
    blueprintLights.push({ d: archPath(archLeft, sill, archWidth, crown, true), x: cx });

    // Brackets under the rim, two per bay, as on the tower.
    for (const offset of [-0.25, 0.25]) {
        const th = centre + offset * BAY;
        const width = 0.035 * pitch;
        const top = wallY(th, CORBEL_BOTTOM);

        details.push({ d: rectPath(wallX(th) - width / 2, top, width, wallY(th, CORBEL_TOP) - top), x: cx });
    }
}

export const BLUEPRINT = {
    // Everything missing: between the rebuilt rim and the ruined top edge.
    region: `${alongWall(1)} L${n(rightEndX)},${RUIN_EDGE_END_Y} L${ruinEdgeBackwards.join(' L')} Z`,
    outline: [
        alongWall(1),
        verticalLine(rightEndX, wallY(WALL_END, 1), RUIN_EDGE_END_Y),
    ],
    cornices: [TIER3_BASE, TIER3_PLINTH, TIER3_SILL, TIER3_TOP, ATTIC_BASE, ATTIC_TOP].map((f) =>
        alongWall(f),
    ),
    pilasters,
    openings,
    // Fainter texture: balustrade rail, stone courses in the attic, brackets.
    details: [
        ...[BALUSTRADE, ...ATTIC_COURSES].map((f) => ({ d: alongWall(f), x: 0 })),
        ...details,
    ],
};

// ─── Lights ──────────────────────────────────────────────────

export type Light = { d: string; x: number; ghost: boolean };

// Openings of the surviving building: [x, y, width, height, arched?]. Found by
// tracing the etching's dark and see-through openings, then checked by eye.
const ARCHES: [number, number, number, number, boolean][] = [
    // Tower, tier 3 (upper arcade) and attic windows
    [252, 226, 7, 21, false],
    [333, 173, 14, 34, false],
    [227, 359, 9, 22, true],
    [250, 341, 13, 20, true],
    [272, 322, 24, 52, true],
    [341, 320, 11, 63, true],
    [395, 290, 25, 78, true],
    [464, 276, 40, 84, true],
    // Tower, tier 2
    [212, 468, 16, 58, true],
    [241, 468, 19, 71, true],
    [279, 457, 20, 72, true],
    [326, 448, 23, 81, true],
    [380, 440, 37, 84, true],
    [452, 431, 50, 88, true],
    [537, 423, 61, 92, true],
    // Tower, tier 1
    [221, 595, 10, 35, true],
    [243, 593, 15, 31, true],
    [271, 598, 22, 70, true],
    [321, 592, 28, 80, true],
    [380, 590, 37, 86, true],
    [455, 590, 44, 89, true],
    [543, 588, 53, 95, true],
    [636, 587, 54, 98, true],
    // Middle section
    [660, 444, 43, 69, true],
    [737, 442, 45, 58, true],
    [740, 572, 48, 78, true],
    [819, 571, 49, 71, true],
    // Far wall: upper windows
    [884, 380, 12, 23, false],
    [920, 435, 16, 20, true],
    [1015, 390, 8, 35, false],
    [1112, 413, 10, 24, false],
    [1133, 425, 8, 20, false],
    // Far wall: upper arcade
    [829, 459, 20, 42, true],
    [866, 458, 37, 64, true],
    [921, 467, 31, 63, true],
    [971, 468, 28, 63, true],
    [1019, 472, 21, 38, true],
    [1057, 477, 18, 50, true],
    [1089, 485, 12, 30, true],
    [1114, 487, 9, 24, true],
    [1133, 491, 8, 24, true],
    // Far wall: lower arcade
    [916, 574, 28, 64, true],
    [972, 571, 30, 64, true],
    [1022, 576, 21, 57, true],
    [1059, 575, 17, 54, true],
    [1089, 576, 14, 50, true],
    [1113, 580, 12, 46, true],
    [1135, 583, 10, 40, true],
];

export const LIGHTS: Light[] = [
    ...ARCHES.map(([x, y, w, h, arched]) => ({
        d: arched ? archPath(x, y + h, w, y, true) : rectPath(x, y, w, h),
        x: x + w / 2,
        ghost: false,
    })),
    ...blueprintLights.map((light) => ({ ...light, ghost: true })),
];
