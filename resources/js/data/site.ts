// Contact details and links shown in the footer.
// TODO: replace the placeholder social links with the real ones.
export const SITE = {
    email: 'info@flipswitch.in',
    location: 'Based in India · Working worldwide',
};

export type FooterLink = { label: string; href: string; external?: boolean };

// Each group is drawn as a chip on the footer's circuit board, with a
// designator like a real component (U1, U2…).
export const FOOTER_GROUPS: { id: string; designator: string; title: string; links: FooterLink[] }[] = [
    {
        id: 'services',
        designator: 'U1',
        title: 'Services',
        links: [
            { label: 'AI Consulting', href: '/services/ai-consulting' },
            { label: 'Custom AI Solutions', href: '/services/custom-ai-solutions' },
            { label: 'AI Engineering Lab', href: '/services/ai-engineering-lab' },
            { label: 'AI Products', href: '/services/ai-products' },
            { label: 'All services', href: '/services' },
        ],
    },
    {
        id: 'company',
        designator: 'U2',
        title: 'Company',
        links: [
            { label: 'About', href: '/about' },
            { label: 'FlipSwitched work', href: '/work' },
            { label: 'Contact', href: '/contact' },
        ],
    },
    {
        id: 'connect',
        designator: 'U3',
        title: 'Connect',
        links: [
            { label: 'LinkedIn', href: '#', external: true },
            { label: 'X (Twitter)', href: '#', external: true },
            { label: 'Instagram', href: '#', external: true },
        ],
    },
];
