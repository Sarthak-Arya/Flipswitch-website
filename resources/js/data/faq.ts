// FAQ, grouped by the doubt each question settles. Every answer leads with the
// direct answer, then one line that backs it up.
export type Doubt = { id: string; label: string };

export type Faq = {
    id: string;
    doubt: string;
    question: string;
    answer: string;
};

export const DOUBTS: Doubt[] = [
    { id: 'cost', label: 'Cost' },
    { id: 'risk', label: 'Risk' },
    { id: 'systems', label: 'Your systems' },
    { id: 'location', label: 'Location' },
    { id: 'after', label: 'After launch' },
];

export const FAQS: Faq[] = [
    {
        id: 'cost',
        doubt: 'cost',
        question: 'How much does custom software cost?',
        answer:
            'It depends on scope, so we don’t guess. We work out the architecture and requirements first, then give you a fixed proposal, so you know the full cost before anything is built.',
    },
    {
        id: 'mvp',
        doubt: 'risk',
        question: 'Can you build an MVP first?',
        answer:
            'Yes. Starting small is often the smartest move: we build the smallest version that proves the idea, put it in front of real users, then grow what works.',
    },
    {
        id: 'existing',
        doubt: 'systems',
        question: 'Do you work with existing software?',
        answer:
            'Yes. Depending on what you have, we integrate with it, extend it, replace it or rebuild it, and we’ll tell you honestly which one makes sense.',
    },
    {
        id: 'crm',
        doubt: 'systems',
        question: 'Can you integrate our existing CRM or ERP?',
        answer:
            'Yes, depending on the system and the APIs it offers. We check this early, while designing the system, so there are no surprises halfway through the build.',
    },
    {
        id: 'location',
        doubt: 'location',
        question: 'Do you work with businesses outside India?',
        answer:
            'Yes. Location isn’t a barrier: we work remotely, with regular check-ins and progress you can see along the way.',
    },
    {
        id: 'support',
        doubt: 'after',
        question: 'Do you provide ongoing support?',
        answer:
            'Yes. After launch we keep your system running, fix what comes up and keep improving it as your business uses it.',
    },
];
