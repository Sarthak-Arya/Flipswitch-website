import { Link } from '@inertiajs/react';
import logoMark from '../../../logo.png';

type SiteHeaderProps = {
    variant?: 'default' | 'hero';
};

const navigation = [
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/work', label: 'Work' },
    { href: '#insights', label: 'Insights' },
    { href: '/contact', label: 'Contact' },
];

export function SiteHeader({ variant = 'default' }: SiteHeaderProps) {
    const isHero = variant === 'hero';

    return (
        <header
            className={
                isHero ? 'nav site-header site-header--hero' : 'site-header site-header--default'
            }
        >
            <Link href="/" className="nav__logo brand-link" aria-label="FlipSwitch home">
                <img src={logoMark} alt="" className="brand-mark" aria-hidden="true" />
                <span className="nav__logo-text brand-word">FlipSwitch</span>
            </Link>

            <ul className="nav__links site-nav site-nav--desktop">
                {navigation.map((item) => (
                    <li key={item.label}>
                        <Link href={item.href} className="nav__link">
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>

            <details className="mobile-menu">
                <summary>Menu</summary>
                <nav aria-label="Mobile navigation">
                    {navigation.map((item) => (
                        <Link key={item.label} href={item.href} className="nav__link">
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </details>

            <Link href="/contact" className="nav__cta header-cta">
                <span className="header-cta-full">Book a Discovery Call</span>
                <span className="header-cta-short">Book Call</span>
            </Link>
        </header>
    );
}
