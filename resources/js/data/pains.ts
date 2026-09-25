// Problems a visitor can tick on the home page ("If your business looks like
// this, we should talk"). The ticked ids travel to /contact?pains=… so the
// contact form can start with them.
export type Pain = {
    id: string;
    pain: string;
    build: string;
};

export const PAINS: Pain[] = [
    {
        id: 'data-entry',
        pain: 'Your team copies the same data between five different systems.',
        build: 'One connected source of truth. Enter it once.',
    },
    {
        id: 'manual-work',
        pain: 'Smart people spend hours on work a script could do.',
        build: 'Automations that take the repetitive work off their desks.',
    },
    {
        id: 'crm',
        pain: "Your CRM fits the vendor's idea of sales, not your team's.",
        build: 'A CRM shaped around how your team actually sells.',
    },
    {
        id: 'broken-automation',
        pain: 'Customers call because the automation broke. Again.',
        build: 'Monitored workflows that flag problems before customers do.',
    },
    {
        id: 'no-engineers',
        pain: 'You have an idea for software, but no engineering team.',
        build: 'Your product, designed and built end to end.',
    },
    {
        id: 'legacy',
        pain: "Your software is the reason you can't grow faster.",
        build: 'A modern replacement, migrated without downtime.',
    },
    {
        id: 'ai-start',
        pain: 'Everyone agrees AI could help. Nobody knows where to start.',
        build: 'A prioritised AI roadmap tied to your numbers.',
    },
];
