import { useEffect, useRef } from 'react';
import { CAPABILITIES } from '../../data/capabilities';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { BUS_GAP, EDGE_RAIL_X, orthogonalTrace, type Trace } from './trace';

// Where the current's head sits in the viewport while scrolling (0 = top).
const HEAD_LINE = 0.55;
// Distance of the distribution trunk above the card grid.
const TRUNK_GAP = 36;
const TAP_SECONDS = 0.4;
const TAP_STAGGER = 0.14;

type Tap = {
    at: number;
    path: SVGPathElement;
    node: SVGCircleElement;
    card: HTMLElement;
    order: number;
    lit: boolean;
};

// The circuit through "What we build", continuing the checklist's bus down the
// left. On desktop a trunk runs above the bento grid and a tap routes to each
// card: straight down for the top row, otherwise down the gutter to the card's
// left, across above it and in (like traces between components). All power
// together, cards matching what the visitor ticked first. Stacked on phones,
// each card taps off the bus as the current passes it.
export function BuildCircuit() {
    const svgRef = useRef<SVGSVGElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const svg = svgRef.current;
        const section = svg?.parentElement;

        if (!svg || !section) {
            return;
        }

        const grid = section.querySelector<HTMLElement>('.bento')!;
        const cards = Array.from(section.querySelectorAll<HTMLElement>('.bento__card'));
        const rail = Array.from(svg.querySelectorAll<SVGPathElement>('.circuit__base, .circuit__current'));
        const current = svg.querySelector<SVGPathElement>('.circuit__current')!;
        const dot = svg.querySelector<SVGGElement>('.circuit__head')!;
        const tapGroups = Array.from(svg.querySelectorAll<SVGGElement>('.build__tap'));

        let total = 0;
        let trace: Trace | null = null;
        let taps: Tap[] = [];
        let lastLength = -1;
        let headTween: gsap.core.Tween | null = null;

        const light = (tap: Tap, lit: boolean, delay = 0) => {
            tap.lit = lit;
            const length = tap.path.getTotalLength() || 1;

            gsap.to(tap.path, {
                strokeDashoffset: lit ? 0 : length,
                duration: prefersReducedMotion ? 0 : lit ? TAP_SECONDS : 0.2,
                delay: prefersReducedMotion ? 0 : delay,
                ease: 'power1.inOut',
                overwrite: true,
                onComplete: () => {
                    tap.node.classList.toggle('is-powered', lit);
                    tap.card.classList.toggle('is-powered', lit);
                },
            });

            if (!lit) {
                tap.node.classList.remove('is-powered');
                tap.card.classList.remove('is-powered');
            }
        };

        const build = () => {
            const box = section.getBoundingClientRect();
            const width = section.offsetWidth;
            const height = section.offsetHeight;
            const rect = (el: Element) => {
                const r = el.getBoundingClientRect();

                return { left: r.left - box.left, right: r.right - box.left, top: r.top - box.top, width: r.width };
            };

            // Same x as the checklist's bus it continues.
            const list = document.querySelector('.pain__list');
            const busX = Math.round(
                Math.max(EDGE_RAIL_X, (list ? rect(list).left : rect(grid).left) - BUS_GAP),
            );

            const boxes = cards.map(rect);
            const columns = new Set(boxes.map((b) => Math.round(b.left))).size;
            const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
            const firstTop = Math.min(...boxes.map((b) => b.top));
            const trunkY = Math.round(firstTop - TRUNK_GAP);

            // Each tap: its route and the length along the bus where it powers.
            const routes: { d: string; end: [number, number]; y: number }[] = boxes.map((b, i) => {
                const cx = Math.round(b.left + b.width / 2);
                const top = Math.round(b.top);

                if (columns === 1) {
                    const y = top + 40;

                    return { d: `M${busX},${y} H${Math.round(b.left)}`, end: [Math.round(b.left), y], y };
                }

                if (b.top - firstTop < 4) {
                    return { d: `M${busX},${trunkY} H${cx} V${top}`, end: [cx, top], y: trunkY };
                }

                // Lower cards: down the gutter to this card's left, then across and in.
                const gutterX = Math.round(b.left - gap / 2);
                const aboveY = Math.round(top - gap / 2);

                return {
                    d: `M${busX},${trunkY} H${gutterX} V${aboveY} H${cx} V${top}`,
                    end: [cx, top],
                    y: trunkY,
                };
            });

            const lastY = Math.max(...routes.map((r) => r.y));

            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            svg.style.height = `${height}px`;

            // On to the bottom edge, where "See what we've built" picks it up.
            trace = orthogonalTrace([
                [busX, 0],
                [busX, Math.max(lastY, height)],
            ]);
            rail.forEach((path) => path.setAttribute('d', trace!.d));
            total = trace.total;
            current.style.strokeDasharray = `${total}`;

            const wasLit = taps.map((tap) => tap.lit);

            taps = routes.map((route, i) => {
                const [base, path] = Array.from(tapGroups[i].querySelectorAll<SVGPathElement>('path'));
                const node = tapGroups[i].querySelector<SVGCircleElement>('circle')!;
                base.setAttribute('d', route.d);
                path.setAttribute('d', route.d);
                node.setAttribute('cx', String(route.end[0]));
                node.setAttribute('cy', String(route.end[1]));

                const length = path.getTotalLength() || 1;
                const lit = wasLit[i] ?? false;
                gsap.killTweensOf(path);
                path.style.strokeDasharray = `${length}`;
                path.style.strokeDashoffset = lit ? '0' : `${length}`;

                return { at: route.y, path, node, card: cards[i], order: i, lit };
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

            if (length === lastLength) {
                return;
            }

            lastLength = length;
            current.style.strokeDashoffset = `${total - length}`;
            headTween.progress(length / total);
            dot.style.opacity = length > 0 && length < total ? '1' : '0';

            // Taps newly reached this frame power in sequence, matches first.
            const reached = taps
                .filter((tap) => !tap.lit && length >= tap.at)
                .sort((a, b) => {
                    const match = (t: Tap) => (t.card.classList.contains('is-match') ? 0 : 1);

                    return match(a) - match(b) || a.order - b.order;
                });

            reached.forEach((tap, i) => light(tap, true, i * TAP_STAGGER));
            taps.filter((tap) => tap.lit && length < tap.at).forEach((tap) => light(tap, false));
        };

        const resize = new ResizeObserver(() => build());

        build();
        resize.observe(grid);
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
        <svg ref={svgRef} className="circuit build__circuit" aria-hidden="true" preserveAspectRatio="none">
            <path className="circuit__base" />
            <path className="circuit__current" />
            {CAPABILITIES.map((capability) => (
                <g key={capability.id} className="build__tap">
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
