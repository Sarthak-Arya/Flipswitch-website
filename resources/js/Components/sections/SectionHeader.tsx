import type { ReactNode } from 'react';

type SectionHeaderProps = {
    index: string;
    label: string;
    title: ReactNode;
    kicker?: ReactNode;
    lead?: ReactNode;
};

export function SectionHeader({ index, label, title, kicker, lead }: SectionHeaderProps) {
    return (
        <header className="section-head">
            <div className="section-head__bar">
                <span className="section-head__pill">
                    <span className="section-head__index">{index}</span>
                    <span className="section-head__label">{label}</span>
                </span>
                <span className="section-head__rule" aria-hidden="true" />
                <span className="section-head__more" aria-hidden="true">
                    &gt;&gt;&gt;
                </span>
            </div>
            <div className="section-head__main">
                <h2 className="section-head__title">{title}</h2>
                {kicker ? <p className="section-head__kicker">{kicker}</p> : null}
            </div>
            {lead ? <div className="section-head__lead">{lead}</div> : null}
        </header>
    );
}
