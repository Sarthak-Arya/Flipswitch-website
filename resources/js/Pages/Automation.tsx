import { Head } from '@inertiajs/react';
import { AutomationGuide } from '../Components/sections/AutomationGuide';
import { MarketingLayout } from '../Layouts/MarketingLayout';

export default function Automation() {
    return (
        <MarketingLayout>
            <Head title="AI automation for companies" />
            <AutomationGuide />
        </MarketingLayout>
    );
}
