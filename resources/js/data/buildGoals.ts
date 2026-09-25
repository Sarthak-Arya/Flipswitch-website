// Choices for the home page's "What should we build?" section. Each has the
// first thing we'd build for it, shown the moment it's picked. Picked ids travel
// to /contact?build=… so the contact form can start with them.
export type BuildGoal = {
    id: string;
    label: string;
    title: string;
    start: string;
};

export const BUILD_GOALS: BuildGoal[] = [
    {
        id: 'automate',
        label: 'Automate the busywork',
        title: 'Workflow automation',
        start: 'We map your busiest workflow and automate its most repetitive step first.',
    },
    {
        id: 'ai',
        label: 'Add AI where it pays off',
        title: 'AI, where it pays',
        start: 'We find the one task where AI saves real time, then prove it with a pilot.',
    },
    {
        id: 'voice',
        label: 'Answer every call with an AI agent',
        title: 'AI voice agent',
        start: 'We script your most common call, connect it to your calendar and CRM, and test it on real calls.',
    },
    {
        id: 'crm',
        label: 'Get a CRM that fits how we sell',
        title: 'A CRM that fits',
        start: 'We model your real sales stages first, then add routing, follow-ups and reporting.',
    },
    {
        id: 'portal',
        label: 'Give customers a self-serve portal',
        title: 'Customer portal',
        start: 'We start with what customers ask your team for most, and make it self-serve.',
    },
    {
        id: 'custom',
        label: 'Build custom software',
        title: 'Custom software',
        start: 'We start with the one screen your team uses most, and build outward from there.',
    },
    {
        id: 'replace',
        label: 'Replace software that holds us back',
        title: 'A modern replacement',
        start: 'We rebuild the parts that slow you down first, and migrate your data without downtime.',
    },
    {
        id: 'unsure',
        label: "I'm not sure yet",
        title: 'A clear starting point',
        start: 'We look at how work moves through your business and show you the three best places to start.',
    },
];
