import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { BUS_GAP, EDGE_RAIL_X, orthogonalTrace, type Trace } from './trace';

// Where the current's head sits in the viewport while scrolling (0 = top).
const HEAD_LINE = 0.55;
// Height at which the trace crosses the page (below the live-feed strip).
const CROSSING_Y = 80;

// The circuit through "See what we've built", continuing "What we build": in
// down the left bus, across the page left to right, then down a rail to the
// right of the showreel to the end of the section. A branch runs into the
// carousel's edge; when it connects, the reel powers on (the cards flicker).
export function ShowcaseCircuit() {
    const svgRef = useRef<SVGSVGElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const svg = svgRef.current;
        const section = svg?.parentElement;

        if (!svg || !section) {
            return;
        }

        const reel = section.querySelector<HTMLElement>('.reel')!;
        const body = section.querySelector<HTMLElement>('.reel__body')!;
        const stage = section.querySelector<HTMLElement>('.reel__stage')!;
        const rail = Array.from(svg.querySelectorAll<SVGPathElement>('.circuit__base, .circuit__current'));
        const current = svg.querySelector<SVGPathElement>('.circuit__current')!;
        const branchPaths = Array.from(svg.querySelectorAll<SVGPathElement>('.showcase__branch path'));
        const branch = svg.querySelector<SVGPathElement>('.showcase__branch .circuit__stub')!;
        const branchNode = svg.querySelector<SVGCircleElement>('.showcase__branch .circuit__node')!;
        const endNode = svg.querySelector<SVGCircleElement>('.showcase__end')!;
        const dot = svg.querySelector<SVGGElement>('.circuit__head')!;

        let total = 0;
        let branchAt = 0;
        let powered = false;
        let lastLength = -1;
        let trace: Trace | null = null;
        let headTween: gsap.core.Tween | null = null;

        const build = () => {
            const box = section.getBoundingClientRect();
            const width = section.offsetWidth;
            const height = section.offsetHeight;
            const left = (el: Element) => el.getBoundingClientRect().left - box.left;
            const right = (el: Element) => el.getBoundingClientRect().right - box.left;

            // Same x as the bus it continues; the rail sits right of the reel.
            const list = document.querySelector('.pain__list');
            const busX = Math.round(Math.max(EDGE_RAIL_X, (list ? left(list) : left(reel)) - BUS_GAP));
            const reelRight = right(reel);
            const railX = Math.round(reelRight + (width - reelRight) / 2);
            const stageBox = stage.getBoundingClientRect();
            const branchY = Math.round(stageBox.top + stageBox.height / 2 - box.top);
            const endY = height - 30;

            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            svg.style.height = `${height}px`;

            trace = orthogonalTrace([
                [busX, 0],
                [busX, CROSSING_Y],
                [railX, CROSSING_Y],
                [railX, endY],
            ]);
            rail.forEach((path) => path.setAttribute('d', trace!.d));
            total = trace.total;
            current.style.strokeDasharray = `${total}`;
            branchAt = trace.lengths[2] + (branchY - CROSSING_Y);

            const d = `M${railX},${branchY} H${Math.round(right(stage))}`;
            branchPaths.forEach((path) => path.setAttribute('d', d));
            branchNode.setAttribute('cx', String(Math.round(right(stage))));
            branchNode.setAttribute('cy', String(branchY));
            endNode.setAttribute('cx', String(railX));
            endNode.setAttribute('cy', String(endY));

            const length = branch.getTotalLength() || 1;
            gsap.killTweensOf(branch);
            branch.style.strokeDasharray = `${length}`;
            branch.style.strokeDashoffset = powered ? '0' : `${length}`;

            headTween?.kill();
            headTween = gsap.to(dot, { motionPath: { path: current }, ease: 'none', paused: true });

            lastLength = -1;
            render();
        };

        const setPowered = (on: boolean) => {
            powered = on;
            branchNode.classList.toggle('is-powered', on);
            gsap.to(branch, {
                strokeDashoffset: on ? 0 : branch.getTotalLength() || 1,
                duration: prefersReducedMotion ? 0 : on ? 0.35 : 0.2,
                ease: 'power2.out',
                overwrite: true,
                // The reel powers on once the branch reaches it.
                onComplete: () => body.classList.toggle('is-powered', on),
            });

            if (!on) {
                body.classList.remove('is-powered');
            }
        };

        const render = () => {
            if (!headTween || !trace) {
                return;
            }

            const y = window.innerHeight * HEAD_LINE - section.getBoundingClientRect().top;
            const length = Math.round(prefersReducedMotion ? total : trace.lengthForY(y));

            if (length === lastLength) {
                return;
            }

            lastLength = length;
            current.style.strokeDashoffset = `${total - length}`;
            headTween.progress(length / total);
            dot.style.opacity = length > 0 && length < total ? '1' : '0';
            endNode.classList.toggle('is-powered', length >= total);

            if (length >= branchAt !== powered) {
                setPowered(length >= branchAt);
            }
        };

        build();
        ScrollTrigger.addEventListener('refresh', build);
        gsap.ticker.add(render);

        return () => {
            ScrollTrigger.removeEventListener('refresh', build);
            gsap.ticker.remove(render);
            headTween?.kill();
        };
    }, [prefersReducedMotion]);

    return (
        <svg ref={svgRef} className="circuit showcase__circuit" aria-hidden="true" preserveAspectRatio="none">
            <path className="circuit__base" />
            <path className="circuit__current" />
            <g className="showcase__branch">
                <path className="circuit__stub-base" />
                <path className="circuit__stub" />
                <circle className="circuit__node" r="4" />
            </g>
            <circle className="circuit__node showcase__end" r="4" />
            <g className="circuit__head">
                <circle className="circuit__head-glow" r="12" />
                <circle className="circuit__head-core" r="3.5" />
            </g>
        </svg>
    );
}
