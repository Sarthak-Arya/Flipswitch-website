import { Head } from '@inertiajs/react';
import { PageHero } from '../Components/sections/PageHero';
import { MarketingLayout } from '../Layouts/MarketingLayout';

type AboutProps = {
    values: string[];
};

export default function About({ values }: AboutProps) {
    return (
        <MarketingLayout>
            <Head title="About" />

            <PageHero
                eyebrow="About FlipSwitch"
                title="Technology should serve purpose."
                summary="FlipSwitch exists to help businesses responsibly harness AI and automation to achieve intelligent growth."
            />

            <section className="page-section" data-reveal>
                <h2>Core Values</h2>
                <ul>
                    {values.map((value) => (
                        <li key={value}>{value}</li>
                    ))}
                </ul>
            </section>
        </MarketingLayout>
    );
}
