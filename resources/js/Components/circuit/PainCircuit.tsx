import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { PAINS } from '../../data/pains';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { BUS_GAP, EDGE_RAIL_X, orthogonalTrace, type Trace } from './trace';

// Where the current's head sits in the viewport while scrolling (0 = top).
const HEAD_LINE = 0.55;
// Height at which the trace crosses the page, below the top of the section.
const CROSSING_Y = 60;

type Tap = {
    // Distance along the trace at which the bus has current here.
    at: number;
    path: SVGPathElement;
    node: SVGCircleElement;
    // Whether the tap should be live (its switch is on / anything is ticked).
    wanted: () => boolean;
    lit: boolean;
};

// The circuit through the pain checklist, continuing "Why FlipSwitch": in from
// the right-hand rail, across the page right to left, then down a bus along
// the left of the list to the button. Each row flipped on taps into the bus;
// once anything is ticked, the bus reaches the button and it lights up.
export function PainCircuit() {
    const svgRef = useRef<SVGSVGElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const svg = svgRef.current;
        const section = svg?.parentElement;

        if (!svg || !section) {
            return;
        }

        const list = section.querySelector<HTMLElement>('.pain__list')!;
        const rows = Array.from(section.querySelectorAll<HTMLElement>('.pain__row'));
        const cta = section.querySelector<HTMLElement>('.pain__cta')!;
        const rail = Array.from(svg.querySelectorAll<SVGPathElement>('.circuit__base, .circuit__current'));
        const current = svg.querySelector<SVGPathElement>('.circuit__current')!;
        const dot = svg.querySelector<SVGGElement>('.circuit__head')!;
        const tapGroups = Array.from(svg.querySelectorAll<SVGGElement>('.pain__tap'));

        let total = 0;
        let trace: Trace | null = null;
        let taps: Tap[] = [];
        let lastLength = -1;
        let headTween: gsap.core.Tween | null = null;

        const setTap = (tap: Tap, lit: boolean) => {
            tap.lit = lit;
            tap.node.classList.toggle('is-powered', lit);
            gsap.to(tap.path, {
                strokeDashoffset: lit ? 0 : tap.path.getTotalLength(),
                duration: prefersReducedMotion ? 0 : lit ? 0.35 : 0.2,
                ease: 'power2.out',
                overwrite: true,
            });
        };

        const build = () => {
            const box = section.getBoundingClientRect();
            const width = section.offsetWidth;
            const height = section.offsetHeight;
            const toSection = (r: DOMRect) => ({
                left: r.left - box.left,
                right: r.right - box.left,
                middle: r.top + r.height / 2 - box.top,
            });

            // Same x as the "Why FlipSwitch" rail it continues.
            const flipTable = document.querySelector('.flip__table');
            const tableRight = flipTable ? flipTable.getBoundingClientRect().right - box.left : width - 80;
            const railX = Math.round(tableRight + (width - tableRight) / 2);
            const busX = Math.round(Math.max(EDGE_RAIL_X, toSection(list.getBoundingClientRect()).left - BUS_GAP));
            const ctaBox = toSection(cta.getBoundingClientRect());
            const ctaY = Math.round(ctaBox.middle);

            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            svg.style.height = `${height}px`;

            trace = orthogonalTrace([
                [railX, 0],
                [railX, CROSSING_Y],
                [busX, CROSSING_Y],
                [busX, ctaY],
                [busX, height],
            ]);
            rail.forEach((path) => path.setAttribute('d', trace!.d));
            total = trace.total;
            current.style.strokeDasharray = `${total}`;

            const onBus = (y: number) => trace!.lengths[2] + (y - CROSSING_Y);
            const anyTicked = () => rows.some((row) => row.classList.contains('is-on'));

            const targets = [
                ...rows.map((row) => ({
                    y: Math.round(toSection(row.querySelector('.pain__switch')!.getBoundingClientRect()).middle),
                    x: toSection(row.querySelector('.pain__switch')!.getBoundingClientRect()).left,
                    wanted: () => row.classList.contains('is-on'),
                })),
                { y: ctaY, x: ctaBox.left, wanted: anyTicked },
            ];

            const wasLit = taps.map((tap) => tap.lit);

            taps = targets.map((target, i) => {
                const [base, path] = Array.from(tapGroups[i].querySelectorAll<SVGPathElement>('path'));
                const node = tapGroups[i].querySelector<SVGCircleElement>('circle')!;
                const d = `M${busX},${target.y} H${Math.round(target.x)}`;
                base.setAttribute('d', d);
                path.setAttribute('d', d);
                node.setAttribute('cx', String(Math.round(target.x)));
                node.setAttribute('cy', String(target.y));

                const length = path.getTotalLength() || 1;
                const lit = wasLit[i] ?? false;
                gsap.killTweensOf(path);
                path.style.strokeDasharray = `${length}`;
                path.style.strokeDashoffset = lit ? '0' : `${length}`;
                node.classList.toggle('is-powered', lit);

                return { at: onBus(target.y), path, node, wanted: target.wanted, lit };
            });

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

            // Taps follow both the scroll (has the bus got current here?) and
            // the visitor's switches, so they are checked every frame.
            taps.forEach((tap) => {
                const lit = length >= tap.at && tap.wanted();

                if (lit !== tap.lit) {
                    setTap(tap, lit);
                }
            });
            cta.classList.toggle('is-connected', taps[taps.length - 1]?.lit ?? false);

            if (length === lastLength) {
                return;
            }

            lastLength = length;
            current.style.strokeDashoffset = `${total - length}`;
            headTween.progress(length / total);
            dot.style.opacity = length > 0 && length < total ? '1' : '0';
        };

        // Rows grow when ticked on phones: re-measure so the taps stay on them.
        const resize = new ResizeObserver(() => build());

        build();
        resize.observe(list);
        ScrollTrigger.addEventListener('refresh', build);
        gsap.ticker.add(render);

        return () => {
            resize.disconnect();
            ScrollTrigger.removeEventListener('refresh', build);
            gsap.ticker.remove(render);
            headTween?.kill();
        };
    }, [prefersReducedMotion]);

    return (
        <svg ref={svgRef} className="circuit pain__circuit" aria-hidden="true" preserveAspectRatio="none">
            <path className="circuit__base" />
            <path className="circuit__current" />
            {/* One tap per problem row, then one to the button. */}
            {Array.from({ length: PAINS.length + 1 }, (_, i) => (
                <g key={i} className="pain__tap">
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
