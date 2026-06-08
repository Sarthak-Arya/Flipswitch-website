export type Service = {
    slug: string;
    name: string;
    summary: string;
};

export type CaseStudy = {
    slug: string;
    title: string;
    summary: string;
    metrics?: Record<string, string>;
};

export type SharedPageProps = {
    app: {
        name: string;
        tagline: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};
