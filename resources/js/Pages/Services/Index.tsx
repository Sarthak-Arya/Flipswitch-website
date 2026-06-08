import { Head } from '@inertiajs/react';
import { PageHero } from '../../Components/sections/PageHero';
import { ServiceList } from '../../Components/sections/ServiceList';
import { MarketingLayout } from '../../Layouts/MarketingLayout';
import type { Service } from '../../types';

type ServicesIndexProps = {
    services: Service[];
};

export default function ServicesIndex({ services }: ServicesIndexProps) {
    return (
        <MarketingLayout>
            <Head title="Services" />

            <PageHero
                eyebrow="Services"
                title="AI implementation with purpose."
                summary="From strategy to implementation, FlipSwitch helps organizations understand where AI creates value and build the systems needed to capture it."
            />

            <ServiceList services={services} />
        </MarketingLayout>
    );
}
