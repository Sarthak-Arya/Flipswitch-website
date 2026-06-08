type PageHeroProps = {
    eyebrow?: string;
    title: string;
    summary: string;
    primaryAction?: {
        href: string;
        label: string;
    };
};

export function PageHero({ eyebrow, title, summary, primaryAction }: PageHeroProps) {
    return (
        <section className="page-section" data-reveal>
            {eyebrow ? <p>{eyebrow}</p> : null}
            <h1>{title}</h1>
            <p>{summary}</p>
            {primaryAction ? <a href={primaryAction.href}>{primaryAction.label}</a> : null}
        </section>
    );
}
