// Shared geometry for the page's circuit traces: paths made of horizontal and
// vertical runs, heading down the page, scrubbed by scroll.

export type Point = [number, number];

// x of the thin rail along the page's left edge, used where the main trace runs
// through the stats and hands over to the "Why FlipSwitch" trace.
export const EDGE_RAIL_X = 10;

// Gap between the checklist / capability grid and the bus running beside it.
export const BUS_GAP = 32;

// Scroll distance spent on a horizontal run of the given length.
const bandFor = (run: number) => Math.min(240, Math.max(40, run * 0.35));

export type Trace = {
    d: string;
    total: number;
    // Distance along the trace to each point.
    lengths: number[];
    // Scroll position (the head line, in the trace's y) -> distance along it.
    lengthForY: (y: number) => number;
};

// Vertical runs follow the scroll 1:1. A horizontal run is spread over a band of
// scroll centred on its height, borrowing half the band from the vertical runs
// either side, so the head sweeps across instead of jumping.
export function orthogonalTrace(input: Point[]): Trace {
    const points = input.filter(
        (p, i) => i === 0 || p[0] !== input[i - 1][0] || p[1] !== input[i - 1][1],
    );
    const lengths = [0];

    for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        lengths.push(lengths[i - 1] + Math.abs(x1 - x0) + Math.abs(y1 - y0));
    }

    const total = lengths[lengths.length - 1];
    const breaks: [number, number][] = [[points[0][1], 0]];

    for (let i = 0; i < points.length - 1; i++) {
        const [x0, y] = points[i];
        const [x1, y1] = points[i + 1];

        if (y !== y1) {
            continue;
        }

        const half = bandFor(Math.abs(x1 - x0)) / 2;
        const before = i > 0 ? Math.min(half, (points[i][1] - points[i - 1][1]) / 2) : 0;
        const after = i + 2 < points.length ? Math.min(half, (points[i + 2][1] - y) / 2) : 0;

        breaks.push([y - before, lengths[i] - before], [y + after, lengths[i + 1] + after]);
    }

    breaks.push([points[points.length - 1][1], total]);

    const lengthForY = (y: number) => {
        if (y <= breaks[0][0]) {
            return 0;
        }

        for (let i = 1; i < breaks.length; i++) {
            const [ya, la] = breaks[i - 1];
            const [yb, lb] = breaks[i];

            if (y <= yb) {
                return yb === ya ? lb : la + ((y - ya) / (yb - ya)) * (lb - la);
            }
        }

        return total;
    };

    return {
        d: `M${points.map(([x, y]) => `${x},${y}`).join(' L')}`,
        total,
        lengths,
        lengthForY,
    };
}
