// "How it works": what happens after someone gets in touch. Each step says what
// the client walks away with and what we need from them, so there are no
// unknowns; `system` names the state of the diagram beside the steps.
export type ProcessStep = {
    id: string;
    number: string;
    name: string;
    title: string;
    description: string;
    youGet: string;
    yourPart: string;
    system: string;
    // The step where the client decides whether to go further.
    decision?: string;
};

export const PROCESS_STEPS: ProcessStep[] = [
    {
        id: 'discovery',
        number: '01',
        name: 'Discovery',
        title: 'We learn how your business actually runs.',
        description:
            'Your workflow, your people and the problem worth solving first, mapped with the team who does the work, not just the org chart.',
        youGet: 'A written brief: the problem, the opportunity and what success looks like.',
        yourPart: 'One conversation, and time with the people who know the work.',
        system: 'Sketch',
    },
    {
        id: 'architecture',
        number: '02',
        name: 'Architecture',
        title: 'We design the system before we build it.',
        description:
            'The systems, integrations, data and technology it needs, chosen to fit the tools you already use.',
        youGet: 'A system blueprint, an integration map and a clear plan with timeline and cost.',
        yourPart: 'Sign off the plan. Nothing gets built until you do.',
        system: 'Blueprint',
    },
    {
        id: 'prototype',
        number: '03',
        name: 'Prototype',
        title: 'See it working before you commit.',
        description:
            'A working version on your real data, so you judge a result, not a slide deck.',
        youGet: 'A prototype you can click, test and show your team.',
        yourPart: 'Try it, then decide whether to go further.',
        system: 'Working prototype',
        decision: 'Decision point: you only go further if it works.',
    },
    {
        id: 'build',
        number: '04',
        name: 'Build',
        title: 'Engineered for the real world.',
        description:
            'Production engineering, AI, integrations and testing, with progress you can see along the way.',
        youGet: 'A tested system, connected to the tools your team already uses.',
        yourPart: 'Feedback on what you see.',
        system: 'Tested system',
    },
    {
        id: 'launch',
        number: '05',
        name: 'Launch',
        title: 'Switched on, and kept improving.',
        description:
            'We deploy it, train your team and keep improving it as your business uses it.',
        youGet: 'A live system, a trained team and a partner who stays.',
        yourPart: 'Use it. We handle the rest.',
        system: 'Live',
    },
];
