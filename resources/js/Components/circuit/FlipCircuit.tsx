import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { EDGE_RAIL_X, orthogonalTrace, type Trace } from './trace';

// Where the current's head sits in the viewport while scrolling (0 = top).
const HEAD_LINE = 0.55;
// Height at which the trace crosses the page, below the top of the section.
const CROSSING_Y = 60;
// Time for the current to run along one branch segment.
const SEGMENT_SECONDS = 0.35;

type Branch = {
    // Distance along the main trace at which the branch powers on.
    at: number;
    // Drawn one after another as the current runs out along the branch.
    segments: SVGPathElement[];
    // Lit together with the segment of the same index.
    nodes: SVGCircleElement[];
    // Elements given `is-powered` as the segment of the same index completes.
    targets: Element[];
    powered: boolean;
    timeline?: gsap.core.Timeline;
};

const drawLength = (path: SVGPathElement) => path.getTotalLength() || 1;

// The circuit through "Why FlipSwitch", continuing the main trace: in from the
// left-edge rail it came down through the stats on, across the page left to
// right, then down the right-hand gutter to the end of the section. Branches off
// the gutter power the headline (vendor line struck, "your business" flickers
// blue) and then the step cards: into 03 and across the gaps to 02 and 01 when
// they sit in a row, or one branch per card when they stack. The pinned comparison
// table has its own tap to the rail (inside the table, so it stays attached
// while pinned), lit here once the current has passed its height.
export function FlipCircuit() {
    const svgRef = useRef<SVGSVGElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const svg = svgRef.current;
        const section = svg?.parentElement;

        if (!svg || !section) {
            return;
        }

        const head = section.querySelector<HTMLElement>('.flip__head')!;
        const strike = section.querySelector<HTMLElement>('.flip__strike')!;
        const table = section.querySelector<HTMLElement>('.flip__table')!;
        const tap = section.querySelector<HTMLElement>('.flip__tap')!;
        const cards = Array.from(section.querySelectorAll<HTMLElement>('.flip__step'));
        const rail = Array.from(svg.querySelectorAll<SVGPathElement>('.circuit__base, .circuit__current'));
        const current = svg.querySelector<SVGPathElement>('.circuit__current')!;
        const dot = svg.querySelector<SVGGElement>('.circuit__head')!;

        // Branch segments: [base, current, node] per segment, headline first.
        const segments = Array.from(svg.querySelectorAll<SVGGElement>('.flip__segment')).map((g) => ({
            base: g.querySelector<SVGPathElement>('.circuit__stub-base')!,
            current: g.querySelector<SVGPathElement>('.circuit__stub')!,
            node: g.querySelector<SVGCircleElement>('.circuit__node')!,
        }));

        let branches: Branch[] = [];

        let total = 0;
        let railY = 0;
        let tableOn = false;
        let lastLength = -1;
        let trace: Trace | null = null;
        let headTween: gsap.core.Tween | null = null;

        const setBranch = (branch: Branch, powered: boolean) => {
            branch.powered = powered;
            branch.timeline?.kill();

            if (!powered) {
                branch.targets.forEach((target) => target.classList.remove('is-powered'));
                branch.nodes.forEach((node) => node.classList.remove('is-powered'));
                branch.timeline = gsap
                    .timeline()
                    .to(branch.segments, {
                        strokeDashoffset: (_, path: SVGPathElement) => drawLength(path),
                        duration: 0.2,
                    });

                return;
            }

            const timeline = gsap.timeline();

            branch.segments.forEach((segment, i) => {
                const at = i * SEGMENT_SECONDS;
                timeline.to(segment, { strokeDashoffset: 0, duration: SEGMENT_SECONDS, ease: 'none' }, at);
                timeline.call(() => {
                    branch.nodes[i]?.classList.add('is-powered');
                    branch.targets[i]?.classList.add('is-powered');
                }, [], at + SEGMENT_SECONDS);
            });

            if (prefersReducedMotion) {
                timeline.progress(1);
            }

            branch.timeline = timeline;
        };

        const build = () => {
            const box = section.getBoundingClientRect();
            const width = section.offsetWidth;
            const height = section.offsetHeight;
            const within = (r: DOMRect) => ({
                left: r.left - box.left,
                right: r.right - box.left,
                top: r.top - box.top,
                middle: r.top + r.height / 2 - box.top,
            });

            // Halfway between the table's right edge and the page edge.
            const tableRight = table.getBoundingClientRect().right - box.left;
            const railX = Math.round(tableRight + (width - tableRight) / 2);
            railY = CROSSING_Y;
            // To the bottom edge, where the checklist's trace carries on.
            const endY = height;

            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            svg.style.height = `${height}px`;

            trace = orthogonalTrace([
                [EDGE_RAIL_X, 0],
                [EDGE_RAIL_X, CROSSING_Y],
                [railX, CROSSING_Y],
                [railX, endY],
            ]);
            rail.forEach((path) => path.setAttribute('d', trace!.d));
            total = trace.total;
            current.style.strokeDasharray = `${total}`;

            const onRail = (y: number) => trace!.lengths[2] + (y - CROSSING_Y);

            // A segment: a horizontal run from x1 to x2 at y, its node at x2.
            let used = 0;
            const segment = (y: number, x1: number, x2: number) => {
                const s = segments[used++];
                const d = `M${Math.round(x1)},${y} H${Math.round(x2)}`;
                s.base.setAttribute('d', d);
                s.current.setAttribute('d', d);
                s.node.setAttribute('cx', String(Math.round(x2)));
                s.node.setAttribute('cy', String(y));

                return s;
            };

            branches.forEach((branch) => branch.timeline?.kill());
            branches = [];

            // Headline: into the end of the vendor line's last line of text.
            const lines = strike.getClientRects();
            const last = within(lines[lines.length - 1]);
            const headlineY = Math.round(last.middle);
            const toHeadline = segment(headlineY, railX, last.right + 16);
            branches.push({
                at: onRail(headlineY),
                segments: [toHeadline.current],
                nodes: [toHeadline.node],
                targets: [head],
                powered: false,
            });

            // Steps: in a row, into card 03 then across the gaps to 02 and 01;
            // stacked, one branch into each card as the current passes it.
            const boxes = cards.map((card) => within(card.getBoundingClientRect()));
            const inRow = Math.abs(boxes[0].top - boxes[boxes.length - 1].top) < 4;

            if (inRow) {
                const y = Math.round(boxes[0].middle);
                const links = [
                    segment(y, railX, boxes[2].right),
                    segment(y, boxes[2].left, boxes[1].right),
                    segment(y, boxes[1].left, boxes[0].right),
                ];
                branches.push({
                    at: onRail(y),
                    segments: links.map((s) => s.current),
                    nodes: links.map((s) => s.node),
                    targets: [cards[2], cards[1], cards[0]],
                    powered: false,
                });
            } else {
                boxes.forEach((b, i) => {
                    const y = Math.round(b.middle);
                    const link = segment(y, railX, b.right);
                    branches.push({
                        at: onRail(y),
                        segments: [link.current],
                        nodes: [link.node],
                        targets: [cards[i]],
                        powered: false,
                    });
                });
            }

            // Hide any segments this layout does not use.
            segments.slice(used).forEach((s) => {
                s.base.setAttribute('d', '');
                s.current.setAttribute('d', '');
                s.node.setAttribute('cx', '-99');
            });

            segments.forEach(({ current: path, node }) => {
                const length = drawLength(path);
                gsap.killTweensOf(path);
                path.style.strokeDasharray = `${length}`;
                path.style.strokeDashoffset = `${length}`;
                node.classList.remove('is-powered');
            });
            [head, ...cards].forEach((target) => target.classList.remove('is-powered'));

            // The pinned table's tap reaches from its right edge to the rail.
            tap.style.width = `${Math.max(0, railX - tableRight)}px`;

            headTween?.kill();
            headTween = gsap.to(dot, { motionPath: { path: current }, ease: 'none', paused: true });

            lastLength = -1;
            render();
        };

        const render = () => {
            if (!headTween || !trace) {
                return;
            }

            const y = window.innerHeight * HEAD_LINE - section.getBoundingClientRect().top;
            const length = Math.round(prefersReducedMotion ? total : trace.lengthForY(y));

            // The table tap is fixed on screen while pinned, so it is lit once
            // the current on the rail has passed its height on screen.
            const tapY = tap.getBoundingClientRect().top;
            const onTable =
                length > trace.lengths[2] + railY &&
                (prefersReducedMotion || tapY <= window.innerHeight * HEAD_LINE);

            if (onTable !== tableOn) {
                tableOn = onTable;
                table.classList.toggle('is-connected', onTable);
            }

            if (length === lastLength) {
                return;
            }

            lastLength = length;
            current.style.strokeDashoffset = `${total - length}`;
            headTween.progress(length / total);
            dot.style.opacity = length > 0 && length < total ? '1' : '0';

            branches.forEach((branch) => {
                const powered = length >= branch.at;

                if (powered !== branch.powered) {
                    setBranch(branch, powered);
                }
            });

        };

        build();
        ScrollTrigger.addEventListener('refresh', build);
        gsap.ticker.add(render);

        return () => {
            ScrollTrigger.removeEventListener('refresh', build);
            gsap.ticker.remove(render);
            headTween?.kill();
            branches.forEach((branch) => branch.timeline?.kill());
        };
    }, [prefersReducedMotion]);

    return (
        <svg ref={svgRef} className="circuit flip__circuit" aria-hidden="true" preserveAspectRatio="none">
            <path className="circuit__base" />
            <path className="circuit__current" />
            {/* Branch segments: one to the headline, up to three to the step cards. */}
            {[0, 1, 2, 3].map((i) => (
                <g key={i} className="flip__segment">
                    <path className="circuit__stub-base" />
                    <path className="circuit__stub" />
                    <circle className="circuit__node" r="4" />
                </g>
            ))}
            <g className="circuit__head">
                <circle className="circuit__head-glow" r="12" />
                <circle className="circuit__head-core" r="3.5" />
            </g>
        </svg>
    );
}
