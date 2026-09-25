import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { orthogonalTrace, type Point, type Trace } from './trace';

// Where the current's head sits in the viewport while scrolling (0 = top).
const HEAD_LINE = 0.55;

export type Layout = {
    width: number;
    height: number;
    // An element's box, relative to the section.
    box: (selector: string) => { left: number; right: number; top: number; bottom: number; cx: number; cy: number };
    // The middle of the page margin left / right of an element (usually the
    // section's inner column), where the trace runs down the page.
    leftMargin: (selector: string) => number;
    rightMargin: (selector: string) => number;
};

type SectionCircuitProps = {
    // The trace's runs through this section: each one a list of points, drawn
    // as the head line scrolls past (so a run can stop at something and pick
    // up again further down). Selectors are looked up in the whole page, so a
    // run can start where the previous section's trace left off.
    route: (layout: Layout) => Point[][];
    // Called when the current reaches (or leaves) the end of the last run.
    onEnd?: (reached: boolean) => void;
    // For the last section: the page may end before the head line gets to
    // the end of the trace, so the final stretch of scroll carries it there.
    finishAtBottom?: boolean;
};

// The page's circuit through one section: the runs `route` describes, a node
// at the end of each, and the glowing head where the current is.
export function SectionCircuit({ route, onEnd, finishAtBottom = false }: SectionCircuitProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const routeRef = useRef(route);
    const onEndRef = useRef(onEnd);
    routeRef.current = route;
    onEndRef.current = onEnd;
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const svg = svgRef.current;
        const section = svg?.parentElement;

        if (!svg || !section) {
            return;
        }

        const dot = svg.querySelector<SVGGElement>('.circuit__head')!;
        let runs: { trace: Trace; base: SVGPathElement; current: SVGPathElement; node: SVGCircleElement }[] = [];
        let lastY = NaN;
        let reached = false;
        let endY = 0;

        const build = () => {
            const frame = section.getBoundingClientRect();
            const width = section.offsetWidth;
            const height = section.offsetHeight;
            const box = (selector: string) => {
                const el = document.querySelector(selector);
                const r = el ? el.getBoundingClientRect() : frame;
                const left = r.left - frame.left;
                const top = r.top - frame.top;

                return {
                    left,
                    right: left + r.width,
                    top,
                    bottom: top + r.height,
                    cx: left + r.width / 2,
                    cy: top + r.height / 2,
                };
            };
            const layout: Layout = {
                width,
                height,
                box,
                leftMargin: (selector) => Math.round(Math.max(8, box(selector).left / 2)),
                rightMargin: (selector) => {
                    const right = box(selector).right;

                    return Math.round(Math.min(width - 8, right + (width - right) / 2));
                },
            };

            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            svg.style.height = `${height}px`;

            const points = routeRef.current(layout).map((run) =>
                run.map(([x, y]) => [Math.round(x), Math.round(y)] as Point),
            );

            // One path pair and end node per run, created as needed.
            svg.querySelectorAll('.section-circuit__run').forEach((el) => el.remove());
            runs = points.map((run) => {
                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                group.setAttribute('class', 'section-circuit__run');
                const base = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const current = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                base.setAttribute('class', 'circuit__base');
                current.setAttribute('class', 'circuit__current');
                node.setAttribute('class', 'circuit__node');
                node.setAttribute('r', '4');

                const trace = orthogonalTrace(run);
                const [endX, endY] = run[run.length - 1];
                base.setAttribute('d', trace.d);
                current.setAttribute('d', trace.d);
                current.style.strokeDasharray = `${trace.total}`;
                current.style.strokeDashoffset = `${trace.total}`;
                node.setAttribute('cx', String(endX));
                node.setAttribute('cy', String(endY));

                group.append(base, current, node);
                svg.insertBefore(group, dot);

                return { trace, base, current, node };
            });

            const lastRun = points[points.length - 1];
            endY = lastRun ? lastRun[lastRun.length - 1][1] : 0;
            lastY = NaN;
            render();
        };

        const render = () => {
            const top = section.getBoundingClientRect().top;
            let y = window.innerHeight * HEAD_LINE - top;

            if (finishAtBottom) {
                // How far short of the end the head would stop at the bottom
                // of the page, made up over that much of the last scroll.
                const remaining = Math.max(
                    0,
                    document.documentElement.scrollHeight - window.innerHeight - window.scrollY,
                );
                const short = Math.max(0, endY + 2 - (y + remaining));
                const ramp = Math.max(short, 240);
                y += short * Math.max(0, 1 - remaining / ramp);
            }

            y = Math.round(y);

            if (y === lastY || !runs.length) {
                return;
            }

            lastY = y;
            let head: DOMPoint | null = null;

            runs.forEach(({ trace, current, node }) => {
                const length = prefersReducedMotion ? trace.total : Math.round(trace.lengthForY(y));
                current.style.strokeDashoffset = `${trace.total - length}`;
                node.classList.toggle('is-powered', length >= trace.total);

                if (length > 0 && length < trace.total) {
                    head = current.getPointAtLength(length);
                }
            });

            if (head) {
                const { x, y: headY } = head as DOMPoint;
                dot.setAttribute('transform', `translate(${x} ${headY})`);
                dot.style.opacity = '1';
            } else {
                dot.style.opacity = '0';
            }

            const last = runs[runs.length - 1];
            const atEnd = prefersReducedMotion || last.trace.lengthForY(y) >= last.trace.total;

            if (atEnd !== reached) {
                reached = atEnd;
                onEndRef.current?.(atEnd);
            }
        };

        const resize = new ResizeObserver(() => build());

        build();
        resize.observe(section);
        ScrollTrigger.addEventListener('refresh', build);
        gsap.ticker.add(render);

        return () => {
            resize.disconnect();
            ScrollTrigger.removeEventListener('refresh', build);
            gsap.ticker.remove(render);
        };
    }, [prefersReducedMotion, finishAtBottom]);

    return (
        <svg ref={svgRef} className="circuit section-circuit" aria-hidden="true" preserveAspectRatio="none">
            <g className="circuit__head">
                <circle className="circuit__head-glow" r="12" />
                <circle className="circuit__head-core" r="3.5" />
            </g>
        </svg>
    );
}
