import { Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { gsap, ScrollTrigger } from '../lib/gsap';

type SiteHeaderProps = {
    // Kept for the older hero component; both render the same header now.
    variant?: 'default' | 'hero';
};

const navigation = [
    { href: '/services', label: 'Services' },
    { href: '/work', label: 'Work' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
];

// Past this much scroll, scrolling back up brings the floating header down.
const FLOAT_AFTER = 480;

// The FlipSwitch mark (logo.png) drawn inline: a switch whose blue half is
// "on". The off half is outlined so it stays visible on light backgrounds.
export function BrandMark() {
    return (
        <svg className="brand-mark" viewBox="-1 -1 66 36" aria-hidden="true">
            <g fill="none" strokeLinecap="round">
                <path className="brand-mark__edge" d="M31 4 H47 A13 13 0 0 1 47 30 H31" strokeWidth="8" />
                <path className="brand-mark__off" d="M31 4 H47 A13 13 0 0 1 47 30 H31" strokeWidth="6.4" />
                <path className="brand-mark__on" d="M33 4 H17 A13 13 0 0 0 17 30 H27" strokeWidth="8" />
                {/* The off half's lower end sits over the blue, as in the logo. */}
                <path className="brand-mark__edge" d="M31 30 H36" strokeWidth="8" />
                <path className="brand-mark__off" d="M31 30 H36" strokeWidth="6.4" />
            </g>
        </svg>
    );
}

// The header: the logo, the links in a slim capsule, and the call. The
// capsule works like a switch track: a white knob slides behind whichever
// link is hovered and rests on the current page. The button carries a small
// switch that flips on when hovered.
//
// It sits at the top of the page; once the visitor has scrolled a way down,
// scrolling back up drops a floating copy in from the top (rendered into
// <body>, since ScrollSmoother moves the page content). On phones the links
// open as a full-screen menu.
export function SiteHeader(_props: SiteHeaderProps) {
    const [floating, setFloating] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const openMenu = useCallback(() => setMenuOpen(true), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    useEffect(() => setMounted(true), []);

    // Show the floating header when scrolling up, well down the page.
    useEffect(() => {
        const trigger = ScrollTrigger.create({
            start: 0,
            end: 'max',
            onUpdate: (self) => setFloating(self.scroll() > FLOAT_AFTER && self.direction === -1),
        });

        return () => trigger.kill();
    }, []);

    return (
        <>
            <header className="hdr">
                <HeaderBar onMenu={openMenu} />
            </header>

            {mounted
                ? createPortal(
                      <>
                          <div className={`hdr hdr--float${floating && !menuOpen ? ' is-visible' : ''}`} aria-hidden={!floating}>
                              <HeaderBar onMenu={openMenu} compact tabbable={floating} />
                          </div>
                          <MobileMenu open={menuOpen} onClose={closeMenu} />
                      </>,
                      document.body,
                  )
                : null}
        </>
    );
}

type HeaderBarProps = {
    onMenu: () => void;
    compact?: boolean;
    tabbable?: boolean;
};

function HeaderBar({ onMenu, compact = false, tabbable = true }: HeaderBarProps) {
    const { url } = usePage();
    const capsuleRef = useRef<HTMLUListElement>(null);
    const knobRef = useRef<HTMLLIElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();
    const tabIndex = tabbable ? undefined : -1;
    const isCurrent = (href: string) => url.startsWith(href);
    const currentIndex = navigation.findIndex((item) => isCurrent(item.href));

    // Slide the knob behind a link (or hide it when there's nowhere to rest).
    const moveKnob = (index: number, instant = false) => {
        const capsule = capsuleRef.current;
        const knob = knobRef.current;
        const link = capsule?.querySelectorAll<HTMLElement>('a')[index];

        if (!capsule || !knob) {
            return;
        }

        if (!link) {
            gsap.to(knob, { autoAlpha: 0, scale: 0.9, duration: 0.2 });

            return;
        }

        gsap.to(knob, {
            x: link.offsetLeft,
            width: link.offsetWidth,
            autoAlpha: 1,
            scale: 1,
            duration: instant || prefersReducedMotion ? 0 : 0.45,
            ease: 'power3.out',
        });
    };

    useLayoutEffect(() => {
        moveKnob(currentIndex, true);
        // Fonts can change the links' widths after first paint.
        document.fonts?.ready.then(() => moveKnob(currentIndex, true));
    }, [currentIndex]);

    return (
        <div className={`hdr__bar${compact ? ' hdr__bar--compact' : ''}`}>
            <Link href="/" className="hdr__logo" aria-label="FlipSwitch home" tabIndex={tabIndex}>
                <BrandMark />
                <span>FlipSwitch</span>
            </Link>

            <nav className="hdr__nav" aria-label={compact ? undefined : 'Main'}>
                <ul ref={capsuleRef} className="hdr__capsule" onPointerLeave={() => moveKnob(currentIndex)}>
                    <li ref={knobRef} className="hdr__knob" aria-hidden="true" />
                    {navigation.map((item, i) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className="hdr__link"
                                aria-current={isCurrent(item.href) ? 'page' : undefined}
                                tabIndex={tabIndex}
                                onPointerEnter={() => moveKnob(i)}
                                onFocus={() => moveKnob(i)}
                                onBlur={() => moveKnob(currentIndex)}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <Link href="/contact" className="hdr__cta" tabIndex={tabIndex}>
                <span className="hdr__cta-switch" aria-hidden="true">
                    <span />
                </span>
                Book a call
            </Link>

            <button type="button" className="hdr__menu" onClick={onMenu} tabIndex={tabIndex} aria-label="Open menu">
                <span />
                <span />
            </button>
        </div>
    );
}

// Phones: the links, large, over the whole screen, with the call at the foot.
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
    const menuRef = useRef<HTMLDivElement>(null);
    const { url } = usePage();
    const prefersReducedMotion = usePrefersReducedMotion();

    // Close when the page changes.
    useEffect(() => onClose(), [url]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const menu = menuRef.current;

        if (!open || !menu) {
            return;
        }

        if (!prefersReducedMotion) {
            gsap.fromTo(
                menu.querySelectorAll('.hdr-menu__link, .hdr-menu__foot'),
                { autoAlpha: 0, y: 24 },
                { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.1 },
            );
        }

        menu.querySelector<HTMLElement>('.hdr-menu__close')?.focus();
        const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
        const holdPage = (event: Event) => event.preventDefault();
        window.addEventListener('keydown', onKey);
        menu.addEventListener('touchmove', holdPage, { passive: false });
        menu.addEventListener('wheel', holdPage, { passive: false });

        return () => {
            window.removeEventListener('keydown', onKey);
            menu.removeEventListener('touchmove', holdPage);
            menu.removeEventListener('wheel', holdPage);
        };
    }, [open, onClose, prefersReducedMotion]);

    return (
        <div
            ref={menuRef}
            className={`hdr-menu${open ? ' is-open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            aria-hidden={!open}
        >
            <div className="hdr-menu__top">
                <Link href="/" className="hdr__logo" onClick={onClose} tabIndex={open ? undefined : -1}>
                    <BrandMark />
                    <span>FlipSwitch</span>
                </Link>
                <button
                    type="button"
                    className="hdr-menu__close"
                    onClick={onClose}
                    aria-label="Close menu"
                    tabIndex={open ? undefined : -1}
                >
                    <span />
                    <span />
                </button>
            </div>

            <nav className="hdr-menu__nav" aria-label="Mobile">
                {navigation.map((item, i) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="hdr-menu__link"
                        aria-current={url.startsWith(item.href) ? 'page' : undefined}
                        tabIndex={open ? undefined : -1}
                    >
                        <span className="hdr-menu__index">0{i + 1}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="hdr-menu__foot">
                <Link href="/contact" className="hdr-menu__cta" tabIndex={open ? undefined : -1}>
                    Book a call <span aria-hidden="true">→</span>
                </Link>
                <p>One conversation. A clear next step.</p>
            </div>
        </div>
    );
}
