import type { PropsWithChildren } from 'react';
import { SiteFooter } from '../Components/SiteFooter';
import { SiteHeader } from '../Components/SiteHeader';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useScrollSmoother } from '../hooks/useScrollSmoother';

type MarketingLayoutProps = PropsWithChildren<{
    hideHeader?: boolean;
}>;

export function MarketingLayout({ children, hideHeader = false }: MarketingLayoutProps) {
    useScrollSmoother();
    useScrollReveal();

    return (
        <div id="smooth-wrapper" className="app-shell">
            <div id="smooth-content">
                {hideHeader ? null : <SiteHeader />}

                <main>{children}</main>

                <SiteFooter />
            </div>
        </div>
    );
}
