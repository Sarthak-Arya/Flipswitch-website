import { Head } from '@inertiajs/react';
import { HeroSection } from '../Components/sections/HeroSection';
import { ProblemSection } from '../Components/sections/ProblemSection';
import { ProcessList } from '../Components/sections/ProcessList';
import { SectionHeader } from '../Components/sections/SectionHeader';
import { ServiceList } from '../Components/sections/ServiceList';
import { MarketingLayout } from '../Layouts/MarketingLayout';
import type { Service } from '../types';

type HomeProps = {
    services: Service[];
    featuredProof: string[];
};

export default function Home({ services, featuredProof }: HomeProps) {
    return (
        <MarketingLayout hideHeader>
            <Head title="AI Engineering and Automation" />

            <HeroSection />

            <ProblemSection />

            <ServiceList services={services} />

            <section className="page-section" data-reveal>
                <SectionHeader
                    index="04"
                    label="Proof"
                    title={
                        <>
                            <span className="section-head__title-line">Outcomes</span>
                            <span className="section-head__title-line">We Build Toward.</span>
                        </>
                    }
                    kicker="The measurable results that define a successful engagement"
                />
                <ul>
                    {featuredProof.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </section>

            <ProcessList />
        </MarketingLayout>
    );
}
