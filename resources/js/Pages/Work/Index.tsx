import { Head } from '@inertiajs/react';
import { PageHero } from '../../Components/sections/PageHero';
import { MarketingLayout } from '../../Layouts/MarketingLayout';
import type { CaseStudy } from '../../types';

type WorkIndexProps = {
    caseStudies: CaseStudy[];
};

export default function WorkIndex({ caseStudies }: WorkIndexProps) {
    return (
        <MarketingLayout>
            <Head title="Work" />

            <PageHero
                eyebrow="Work"
                title="Measured by operational outcomes."
                summary="Case studies and success stories will live here once project proof is ready to publish."
            />

            <section className="page-section" data-reveal>
                {caseStudies.length > 0 ? (
                    caseStudies.map((caseStudy) => (
                        <article key={caseStudy.slug}>
                            <h2>{caseStudy.title}</h2>
                            <p>{caseStudy.summary}</p>
                        </article>
                    ))
                ) : (
                    <p>No case studies published yet.</p>
                )}
            </section>
        </MarketingLayout>
    );
}
