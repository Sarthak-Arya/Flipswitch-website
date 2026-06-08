import type { PropsWithChildren } from 'react';
import { SiteHeader } from '../Components/SiteHeader';
import { useLenis } from '../hooks/useLenis';
import { useScrollReveal } from '../hooks/useScrollReveal';

type MarketingLayoutProps = PropsWithChildren<{
    hideHeader?: boolean;
}>;

export function MarketingLayout({ children, hideHeader = false }: MarketingLayoutProps) {
    useLenis();
    useScrollReveal();

    return (
        <div className="app-shell">
            {hideHeader ? null : <SiteHeader />}

            <main>{children}</main>

            <footer className="site-footer">
                <p>Flip the Switch to What's Next.</p>
            </footer>
        </div>
    );
}
