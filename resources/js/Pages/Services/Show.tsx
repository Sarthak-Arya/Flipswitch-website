import { Head } from '@inertiajs/react';
import { PageHero } from '../../Components/sections/PageHero';
import { MarketingLayout } from '../../Layouts/MarketingLayout';
import type { Service } from '../../types';

type ServiceShowProps = {
    service: Service;
};

export default function ServiceShow({ service }: ServiceShowProps) {
    return (
        <MarketingLayout>
            <Head title={service.name} />

            <PageHero eyebrow="Service" title={service.name} summary={service.summary} />

            <section className="page-section" data-reveal>
                <h2>Implementation Notes</h2>
                <p>
                    This page is ready for CMS-backed content. Filament resources can replace
                    the temporary static service data once the admin package is installed.
                </p>
            </section>
        </MarketingLayout>
    );
}
