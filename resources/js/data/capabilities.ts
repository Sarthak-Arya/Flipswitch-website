// What FlipSwitch builds ("From idea to intelligent business system"). Each
// capability lists the problems it answers (ids from data/pains.ts), so cards can
// be highlighted for what the visitor ticked in the checklist above.
export type Capability = {
    id: 'ai' | 'software' | 'automation' | 'cx' | 'data' | 'custom';
    title: string;
    outcome: string;
    includes: string[];
    example: string;
    answers: string[];
};

export const CAPABILITIES: Capability[] = [
    {
        id: 'ai',
        title: 'AI Systems',
        outcome: 'Software that understands, decides and acts.',
        includes: ['AI agents', 'Voice agents', 'Copilots', 'RAG', 'Intelligent workflows'],
        example: 'An agent that reads every support email and drafts the reply.',
        answers: ['manual-work', 'ai-start'],
    },
    {
        id: 'software',
        title: 'Business Software',
        outcome: 'Systems shaped around how you actually work.',
        includes: ['CRM', 'HRMS', 'ERP', 'Marketplaces', 'Portals', 'Internal platforms'],
        example: 'A CRM built around your real sales stages, not a template.',
        answers: ['crm', 'legacy'],
    },
    {
        id: 'automation',
        title: 'Automation',
        outcome: 'Your tools, finally talking to each other.',
        includes: ['Integrations', 'Workflows', 'Data sync', 'Approvals'],
        example: 'New order → invoice, stock update and team alert, untouched.',
        answers: ['data-entry', 'manual-work', 'broken-automation'],
    },
    {
        id: 'cx',
        title: 'Customer Experience',
        outcome: 'Answer every customer, on every channel, instantly.',
        includes: ['WhatsApp', 'Voice', 'Web chat', 'Omnichannel'],
        example: 'A WhatsApp agent that books appointments at 2am.',
        answers: ['broken-automation'],
    },
    {
        id: 'data',
        title: 'Data & Intelligence',
        outcome: 'See the business clearly, and act sooner.',
        includes: ['Dashboards', 'Analytics', 'Decision systems', 'AI insights'],
        example: 'One live dashboard instead of five spreadsheets.',
        answers: ['data-entry', 'ai-start'],
    },
    {
        id: 'custom',
        title: 'Custom Engineering',
        outcome: "When nothing off-the-shelf fits, we build it.",
        includes: ['Web', 'Mobile', 'APIs', 'Complex integrations'],
        example: 'Your product idea, designed and built end to end.',
        answers: ['no-engineers', 'legacy'],
    },
];
