import { ProblemCardDescription } from './ProblemCardDescription';
import { ProblemCardVisual, type ProblemVisualVariant } from './ProblemCardVisual';
import { SectionHeader } from './SectionHeader';

type ProblemCard = {
    id: string;
    layout: 'small-a' | 'small-b' | 'large-left' | 'large-right' | 'small-c' | 'small-d';
    heading: string;
    description: string;
    highlight?: string;
    shape: ProblemVisualVariant;
};

const PROBLEM_CARDS: ProblemCard[] = [
    {
        id: 'manual-work',
        layout: 'small-a',
        heading: 'Manual work quietly taxes growth',
        description:
            'Every repeated copy, paste, and follow-up steals focus from work that should move the business forward.',
        highlight: 'steals focus',
        shape: 'stack',
    },
    {
        id: 'visibility-gaps',
        layout: 'small-b',
        heading: 'Leaders cannot manage what they cannot see',
        description:
            'Status lives in chats, sheets, and memory, so decisions arrive late and confidence drops.',
        highlight: 'decisions arrive late',
        shape: 'sphere',
    },
    {
        id: 'system-friction',
        layout: 'large-right',
        heading: 'Disconnected tools create hidden drag',
        description:
            'Teams switch tabs, re-enter data, and rebuild context until operational drag feels normal.',
        highlight: 'operational drag',
        shape: 'cubes',
    },
    {
        id: 'broken-processes',
        layout: 'large-left',
        heading: 'Broken processes make scale expensive',
        description:
            'When workflows depend on heroics and tribal knowledge, every new customer adds pressure instead of leverage.',
        highlight: 'pressure instead of leverage',
        shape: 'lattice',
    },
    {
        id: 'ai-noise',
        layout: 'small-c',
        heading: 'AI hype makes the wrong work look urgent',
        description:
            'New tools promise speed, but without a business case they add cost, complexity, and unclear ROI.',
        highlight: 'unclear ROI',
        shape: 'ring',
    },
    {
        id: 'team-silos',
        layout: 'small-d',
        heading: 'Silos fracture the customer journey',
        description:
            'Sales, operations, and support each hold part of the truth, so follow-ups slip and customers feel the gaps.',
        highlight: 'customers feel the gaps',
        shape: 'helix',
    },
];

export function ProblemSection() {
    return (
        <section className="page-section problem-section" data-reveal>
            <SectionHeader
                index="02"
                label="The Problem"
                title={
                    <>
                        <span className="section-head__title-line">Not Every Workflow</span>
                        <span className="section-head__title-line">Needs AI.</span>
                    </>
                }
                kicker="Before we automate, we find the bottleneck worth fixing"
                lead={
                    <>
                        <p>AI creates value only after the business system is clear.</p>
                        <p>If the workflow leaks time, leads, or context, automation scales the leak.</p>
                    </>
                }
            />
            <div className="problem-section__grid content-grid">
                {PROBLEM_CARDS.map((card) => (
                    <article
                        key={card.id}
                        tabIndex={0}
                        className={`problem-section__card problem-section__card--${card.layout}`}
                    >
                        <span className="problem-section__card-arrow" aria-hidden="true">
                            ↗
                        </span>
                        <div className="problem-section__card-inner">
                            <div className="problem-section__card-copy">
                                <h3 className="problem-section__card-heading">{card.heading}</h3>
                                <ProblemCardDescription
                                    description={card.description}
                                    highlight={card.highlight}
                                />
                            </div>
                            <div className="problem-section__card-visual">
                                <ProblemCardVisual variant={card.shape} />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
            <p className="problem-section__closing">
                We help you know where AI belongs, then engineer the systems that make it useful.
            </p>
        </section>
    );
}
