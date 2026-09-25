import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { FOOTER_GROUPS, SITE } from '../data/site';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { gsap, ScrollSmoother, ScrollTrigger } from '../lib/gsap';
import { BrandMark } from './SiteHeader';

// The footer as a circuit board. On the home page the page's circuit carries
// on into it (down the left margin from the last section); a trunk runs above
// the link groups, which sit on the board like chips (U1, U2, U3), with a
// trace dropping into each. The board powers up as the footer scrolls in, and
// hovering a group lights its trace. At the bottom, the "FlipSwitch" wordmark,
// etched in outline, fills with blue as the visitor reaches the end of the page.
export function SiteFooter() {
    const footerRef = useRef<HTMLElement>(null);
    const [hot, setHot] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();

    // The board: trunk and taps measured from the layout, powered on arrival.
    useEffect(() => {
        const footer = footerRef.current;

        if (!footer) {
            return;
        }

        const svg = footer.querySelector<SVGSVGElement>('.footer__circuit')!;
        const inner = footer.querySelector<HTMLElement>('.footer__inner')!;
        const trunk = Array.from(svg.querySelectorAll<SVGPathElement>('.footer__trunk path'));
        const taps = Array.from(svg.querySelectorAll<SVGGElement>('.footer__tap'));
        const chips = Array.from(footer.querySelectorAll<HTMLElement>('.footer__chip'));
        let powered = false;

        const build = () => {
            const box = footer.getBoundingClientRect();
            const rect = (el: Element) => {
                const r = el.getBoundingClientRect();

                return { left: r.left - box.left, top: r.top - box.top, width: r.width, height: r.height };
            };
            const x = Math.round(Math.max(8, rect(inner).left / 2));
            const boxes = chips.map(rect);
            const stacked = new Set(boxes.map((b) => Math.round(b.left))).size === 1;
            const top = Math.min(...boxes.map((b) => b.top));
            const trunkY = Math.round(top - 34);
            // On the home page the trunk branches off the wire in the last
            // section, where it turns towards the switch.
            const final = document.querySelector('.final');
            const startY = final ? Math.round(final.getBoundingClientRect().top - box.top + 56) : 0;

            svg.setAttribute('viewBox', `0 0 ${footer.offsetWidth} ${footer.offsetHeight}`);
            svg.style.height = `${footer.offsetHeight}px`;

            // Phones: the trunk runs down the margin and taps into each chip's
            // side. Wider: it runs across above them and drops into each.
            const routes = boxes.map((b) => {
                const cx = Math.round(b.left + b.width / 2);

                return stacked
                    ? { d: `M${x},${Math.round(b.top + 26)} H${Math.round(b.left)}`, end: [Math.round(b.left), Math.round(b.top + 26)] }
                    : { d: `M${cx},${trunkY} V${Math.round(b.top)}`, end: [cx, Math.round(b.top)] };
            });
            const last = boxes[boxes.length - 1];
            const trunkD = stacked
                ? `M${x},${startY} V${Math.round(last.top + 26)}`
                : `M${x},${startY} V${trunkY} H${Math.round(last.left + last.width / 2)}`;

            trunk.forEach((path) => path.setAttribute('d', trunkD));
            routes.forEach((route, i) => {
                taps[i].querySelectorAll('path').forEach((path) => path.setAttribute('d', route.d));
                const node = taps[i].querySelector('circle')!;
                node.setAttribute('cx', String(route.end[0]));
                node.setAttribute('cy', String(route.end[1]));
            });

            [trunk[1], ...taps.map((tap) => tap.querySelector<SVGPathElement>('.circuit__stub')!)].forEach((path) => {
                const length = path.getTotalLength() || 1;
                gsap.killTweensOf(path);
                path.style.strokeDasharray = `${length}`;
                path.style.strokeDashoffset = powered ? '0' : `${length}`;
            });
        };

        const powerOn = () => {
            if (powered) {
                return;
            }

            powered = true;
            const stubs = taps.map((tap) => tap.querySelector<SVGPathElement>('.circuit__stub')!);
            const duration = prefersReducedMotion ? 0 : 1;

            gsap.timeline()
                .to(trunk[1], { strokeDashoffset: 0, duration, ease: 'power1.inOut' })
                .to(stubs, { strokeDashoffset: 0, duration: duration * 0.35, stagger: duration * 0.14, ease: 'power1.out' })
                .call(() => {
                    taps.forEach((tap) => tap.querySelector('circle')!.classList.add('is-powered'));
                    chips.forEach((chip) => chip.classList.add('is-powered'));
                });
        };

        // The wordmark fills with blue over the last stretch of the page.
        const fill = footer.querySelector<SVGRectElement>('.footer__word-fill')!;
        const word = footer.querySelector<SVGSVGElement>('.footer__word')!;
        const fillTween = prefersReducedMotion
            ? gsap.set(fill, { attr: { width: 1000 } })
            : gsap.fromTo(
                  fill,
                  { attr: { width: 0 } },
                  {
                      attr: { width: 1000 },
                      ease: 'none',
                      scrollTrigger: { trigger: word, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
                  },
              );

        const trigger = ScrollTrigger.create({ trigger: footer, start: 'top 85%', onEnter: powerOn });
        const resize = new ResizeObserver(() => build());

        build();
        resize.observe(footer);

        if (trigger.progress > 0 || prefersReducedMotion) {
            powerOn();
        }

        return () => {
            resize.disconnect();
            trigger.kill();
            fillTween.scrollTrigger?.kill();
            fillTween.kill();
        };
    }, [prefersReducedMotion]);

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(SITE.email);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            window.location.href = `mailto:${SITE.email}`;
        }
    };

    const backToTop = () => {
        const smoother = ScrollSmoother.get();

        if (smoother) {
            smoother.scrollTo(0, true);
        } else {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
    };

    return (
        <footer ref={footerRef} className="footer">
            <svg className="footer__circuit" aria-hidden="true" preserveAspectRatio="none">
                <g className="footer__trunk">
                    <path className="circuit__base" />
                    <path className="circuit__current" />
                </g>
                {FOOTER_GROUPS.map((group, i) => (
                    <g key={group.id} className={`footer__tap${hot === i ? ' is-hot' : ''}`}>
                        <path className="circuit__stub-base" />
                        <path className="circuit__stub" />
                        <circle className="circuit__node" r="4" />
                    </g>
                ))}
            </svg>

            <div className="footer__inner">
                <div className="footer__brand">
                    <Link href="/" className="footer__logo" aria-label="FlipSwitch home">
                        <BrandMark />
                        <span>FlipSwitch</span>
                    </Link>
                    <p className="footer__tagline">Flip the switch to what's next.</p>

                    <div className="footer__contact">
                        <a href={`mailto:${SITE.email}`} className="footer__email">
                            {SITE.email}
                        </a>
                        <button type="button" className="footer__copy" onClick={copyEmail} aria-live="polite">
                            {copied ? 'Copied ✓' : 'Copy'}
                        </button>
                    </div>
                    <p className="footer__location">
                        <span className="footer__location-dot" aria-hidden="true" />
                        {SITE.location}
                    </p>
                </div>

                <nav className="footer__board" aria-label="Footer">
                    {FOOTER_GROUPS.map((group, i) => (
                        <div
                            key={group.id}
                            className="footer__chip"
                            onPointerEnter={() => setHot(i)}
                            onPointerLeave={() => setHot(null)}
                            onFocus={() => setHot(i)}
                            onBlur={() => setHot(null)}
                        >
                            <p className="footer__chip-head">
                                <span>{group.designator}</span>
                                {group.title}
                            </p>
                            <ul>
                                {group.links.map((link) =>
                                    link.external ? (
                                        <li key={link.label}>
                                            <a href={link.href} target="_blank" rel="noreferrer">
                                                {link.label} <span aria-hidden="true">↗</span>
                                            </a>
                                        </li>
                                    ) : (
                                        <li key={link.label}>
                                            <Link href={link.href}>{link.label}</Link>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="footer__base">
                <p>© {new Date().getFullYear()} FlipSwitch. All rights reserved.</p>
                <div className="footer__legal">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                </div>
                <button type="button" className="footer__top" onClick={backToTop}>
                    <span className="footer__top-switch" aria-hidden="true">
                        <span />
                    </span>
                    Flip it again <span aria-hidden="true">↑</span>
                </button>
            </div>

            <svg className="footer__word" viewBox="0 0 1000 190" aria-hidden="true">
                <defs>
                    <pattern id="footer-etch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                        <path d="M0,0 V6" />
                    </pattern>
                    <clipPath id="footer-fill">
                        <rect className="footer__word-fill" x="0" y="0" width="0" height="190" />
                    </clipPath>
                </defs>
                <text className="footer__word-etch" x="0" y="160" textLength="1000" lengthAdjust="spacingAndGlyphs">
                    FlipSwitch
                </text>
                <text
                    className="footer__word-lit"
                    x="0"
                    y="160"
                    textLength="1000"
                    lengthAdjust="spacingAndGlyphs"
                    clipPath="url(#footer-fill)"
                >
                    FlipSwitch
                </text>
            </svg>
        </footer>
    );
}
