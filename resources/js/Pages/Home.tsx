import { Head } from '@inertiajs/react';
import { AdvisorySection } from '../Components/sections/AdvisorySection';
import { MarketingLayout } from '../Layouts/MarketingLayout';

export default function Home() {
    return (
        <MarketingLayout hideHeader>
            <Head title="AI Engineering and Automation" />

            <AdvisorySection />
        </MarketingLayout>
    );
}
