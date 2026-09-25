import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { EDGE_RAIL_X, orthogonalTrace, type Trace } from './trace';

// Where the current's head settles in the viewport while scrolling (0 = top).
const HEAD_LINE = 0.55;

type Node = {
    length: number;
    target: Element | null;
    stub?: SVGPathElement | null;
};

// Offset of an element inside the advisory section, ignoring transforms so
// scroll-driven animations do not skew the layout of the trace.
function offsetWithin(element: HTMLElement, ancestor: HTMLElement) {
    let top = 0;
    let left = 0;
    let node: HTMLElement | null = element;

    while (node && node !== ancestor) {
        top += node.offsetTop;
        left += node.offsetLeft;
        node = node.offsetParent as HTMLElement | null;
    }

    return { top, left };
}

// The page's circuit through the advisory section: down from the hero switch,
// across above the intro heading, down the left rail past the services to the
// stats heading, then out to the page's left edge and down through the stats,
// where the "Why FlipSwitch" trace picks it up. A branch feeds the services tag.
// Nothing flows until the switch is on; the current then runs to the head line
// and from there is scrubbed by scroll, with the head moved by MotionPath.
export function AdvisoryCircuit() {
    const svgRef = useRef<SVGSVGElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const svg = svgRef.current;
        const advisory = svg?.parentElement;

        if (!svg || !advisory) {
            return;
        }

        const q = <T extends Element>(selector: string) => advisory.querySelector<T>(selector)!;
        const base = svg.querySelector<SVGPathElement>('.circuit__base')!;
        const current = svg.querySelector<SVGPathElement>('.circuit__current')!;
        const head = svg.querySelector<SVGGElement>('.circuit__head')!;
        const stubs = Array.from(svg.querySelectorAll<SVGPathElement>('.circuit__stub'));
        const stubBases = Array.from(svg.querySelectorAll<SVGPathElement>('.circuit__stub-base'));
        const nodeDots = Array.from(svg.querySelectorAll<SVGCircleElement>('.circuit__node'));

        let total = 0;
        let trace: Trace | null = null;
        // 0 = switch off, 1 = on; tweened so the current flows in when flipped.
        const power = { level: advisory.querySelector('.hero-switch.is-on') ? 1 : 0 };
        let nodes: Node[] = [];
        let headTween: gsap.core.Tween | null = null;
        let lastLength = -1;

        const build = () => {
            const width = advisory.offsetWidth;
            const heading = q<HTMLElement>('.advisory__intro .advisory__display');
            const switchTrack = q<HTMLElement>('.hero-switch__track');
            const servicesPanel = q<HTMLElement>('.advisory__panel--services');
            const servicesTag = q<HTMLElement>('.advisory__panel--services .advisory__tag');
            const statsHeading = q<HTMLElement>('.advisory__stats-heading');
            const stats = q<HTMLElement>('.advisory__stats');

            const cx = Math.round(width / 2);
            const railX = Math.round(offsetWithin(servicesPanel, advisory).left / 2);
            const headingTop = offsetWithin(heading, advisory).top;
            const servicesTagBox = offsetWithin(servicesTag, advisory);
            const statsTop = offsetWithin(statsHeading, advisory).top;

            const startY = Math.round(
                offsetWithin(switchTrack, advisory).top + switchTrack.offsetHeight + 6,
            );
            const crossingY = Math.round(headingTop - 28);
            const endY = Math.round(statsTop - 30);
            const statsBottom = offsetWithin(stats, advisory).top + stats.offsetHeight;
            const servicesY = Math.round(servicesTagBox.top + servicesTag.offsetHeight / 2);

            trace = orthogonalTrace([
                [cx, startY],
                [cx, crossingY],
                [railX, crossingY],
                [railX, endY],
                [EDGE_RAIL_X, endY],
                [EDGE_RAIL_X, statsBottom],
            ]);
            base.setAttribute('d', trace.d);
            current.setAttribute('d', trace.d);

            svg.setAttribute('viewBox', `0 0 ${width} ${statsBottom}`);
            svg.style.height = `${statsBottom}px`;

            total = trace.total;

            const drop = crossingY - startY;
            const crossing = Math.abs(cx - railX);
            const lengthAtY = (y: number) => drop + crossing + (y - crossingY);

            const stubPaths = [`M${railX},${servicesY} H${servicesTagBox.left - 10}`];

            stubPaths.forEach((stubPath, i) => {
                stubs[i].setAttribute('d', stubPath);
                stubBases[i].setAttribute('d', stubPath);
            });

            const nodePoints = [
                [cx, crossingY],
                [servicesTagBox.left - 10, servicesY],
                [railX, endY],
            ];

            nodeDots.forEach((dot, i) => {
                dot.setAttribute('cx', String(nodePoints[i][0]));
                dot.setAttribute('cy', String(nodePoints[i][1]));
            });

            stubs.forEach((stub) => {
                const length = stub.getTotalLength();
                gsap.killTweensOf(stub);
                stub.classList.remove('is-powered');
                stub.style.strokeDasharray = `${length}`;
                stub.style.strokeDashoffset = `${length}`;
            });

            nodes = [
                { length: drop, target: heading },
                { length: lengthAtY(servicesY), target: servicesPanel, stub: stubs[0] },
                { length: lengthAtY(endY), target: statsHeading },
            ];

            current.style.strokeDasharray = `${total}`;

            headTween?.kill();
            headTween = gsap.to(head, {
                motionPath: { path: current },
                ease: 'none',
                paused: true,
            });

            lastLength = -1;
            render();
        };

        // Scroll position -> distance along the trace (see orthogonalTrace).
        const lengthForScroll = () => {
            if (prefersReducedMotion || !trace) {
                return total;
            }

            const y = window.innerHeight * HEAD_LINE - advisory.getBoundingClientRect().top;

            return trace.lengthForY(y) * power.level;
        };

        const render = () => {
            if (!headTween || total === 0) {
                return;
            }

            const length = Math.round(lengthForScroll());

            if (length === lastLength) {
                return;
            }

            lastLength = length;
            current.style.strokeDashoffset = `${total - length}`;
            headTween.progress(length / total);
            head.style.opacity = length > 0 && length < total ? '1' : '0';

            nodes.forEach((node, i) => {
                const powered = length >= node.length;

                nodeDots[i].classList.toggle('is-powered', powered);

                // Announce changes so other pieces (e.g. the intro lights) can react.
                if (node.target && node.target.classList.contains('is-powered') !== powered) {
                    node.target.classList.toggle('is-powered', powered);
                    node.target.dispatchEvent(new CustomEvent('circuit:power', { detail: powered }));
                }

                if (node.stub && powered !== node.stub.classList.contains('is-powered')) {
                    node.stub.classList.toggle('is-powered', powered);
                    gsap.to(node.stub, {
                        strokeDashoffset: powered ? 0 : node.stub.getTotalLength(),
                        duration: powered ? 0.5 : 0.25,
                        ease: 'power2.out',
                        overwrite: true,
                    });
                }
            });
        };

        const handleSwitch = (event: Event) => {
            const on = (event as CustomEvent<boolean>).detail;

            gsap.to(power, {
                level: on ? 1 : 0,
                duration: on ? 1.2 : 0.4,
                ease: on ? 'power1.inOut' : 'power2.out',
                overwrite: true,
            });
        };

        build();
        ScrollTrigger.addEventListener('refresh', build);
        advisory.addEventListener('circuit:switch', handleSwitch);
        gsap.ticker.add(render);

        return () => {
            ScrollTrigger.removeEventListener('refresh', build);
            advisory.removeEventListener('circuit:switch', handleSwitch);
            gsap.ticker.remove(render);
            gsap.killTweensOf(power);
            headTween?.kill();
        };
    }, [prefersReducedMotion]);

    return (
        <svg ref={svgRef} className="circuit" aria-hidden="true" preserveAspectRatio="none">
            <path className="circuit__base" />
            <path className="circuit__stub-base" />
            <path className="circuit__current" />
            <path className="circuit__stub" />
            <circle className="circuit__node" r="4" />
            <circle className="circuit__node" r="4" />
            <circle className="circuit__node" r="4" />
            <g className="circuit__head">
                <circle className="circuit__head-glow" r="12" />
                <circle className="circuit__head-core" r="3.5" />
            </g>
        </svg>
    );
}
