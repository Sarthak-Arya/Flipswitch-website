import { SectionHeader } from './SectionHeader';

const processSteps = [
    'Understand the business',
    'Understand the workflows',
    'Identify opportunities',
    'Determine whether AI is necessary',
    'Implement the best available technologies',
    'Measure results',
];

export function ProcessList() {
    return (
        <section className="page-section" data-reveal>
            <SectionHeader
                index="05"
                label="How We Work"
                title={
                    <>
                        <span className="section-head__title-line">A Clear</span>
                        <span className="section-head__title-line">Path Forward.</span>
                    </>
                }
                kicker="A disciplined process from first conversation to measured results"
            />
            <ol>
                {processSteps.map((step) => (
                    <li key={step}>{step}</li>
                ))}
            </ol>
        </section>
    );
}
