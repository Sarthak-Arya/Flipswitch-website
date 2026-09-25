// Projects for the home page's "See what we've built" section.
//
// PLACEHOLDERS: results marked [X] and the problem/system lines must be
// replaced with real project details before launch.
//
// Video: add `loop` (a 6–12s muted clip cropped to the key moment, MP4, 1–3 MB)
// and `poster` to show real footage instead of the coded mock-up, and
// `walkthrough` (a video URL) to show the "Watch walkthrough" pill.
export type Project = {
    id: 'voice' | 'crm' | 'whatsapp';
    name: string;
    // One line for the card caption.
    summary: string;
    result: string;
    problem: string;
    system: string;
    tags: string[];
    // Problems from data/pains.ts this project speaks to.
    answers: string[];
    video?: { loop: string; poster?: string };
    walkthrough?: string;
};

export const PROJECTS: Project[] = [
    {
        id: 'voice',
        name: 'AI Voice Agent',
        summary: 'Answers after-hours calls, books viewings and updates the CRM.',
        result: '[X]% of after-hours calls handled without a person.',
        problem: 'Calls after hours went to voicemail, and so did bookings.',
        system: 'A voice agent that answers, understands intent, books and updates the CRM.',
        tags: ['Real estate', 'Voice AI', 'CRM'],
        answers: ['broken-automation', 'manual-work'],
    },
    {
        id: 'crm',
        name: 'Real Estate CRM',
        summary: 'Every lead in one place: routed, matched to properties, followed up.',
        result: '[X] hours saved per agent, every week.',
        problem: 'Leads scattered across portals, spreadsheets and WhatsApp.',
        system: 'One CRM with lead routing, property matching and AI follow-ups.',
        tags: ['Real estate', 'CRM', 'Automation'],
        answers: ['crm', 'data-entry'],
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp Customer Platform',
        summary: 'One shared inbox for every WhatsApp conversation, campaigns built in.',
        result: '[X]× faster first response.',
        problem: 'Five people sharing one phone, with no customer history.',
        system: 'A shared inbox with campaigns, automations and customer profiles.',
        tags: ['Retail', 'WhatsApp', 'Automation'],
        answers: ['manual-work', 'legacy'],
    },
];
