type ProblemCardDescriptionProps = {
    description: string;
    highlight?: string;
};

export function ProblemCardDescription({ description, highlight }: ProblemCardDescriptionProps) {
    if (!highlight) {
        return <p className="problem-section__card-desc">{description}</p>;
    }

    const highlightIndex = description.indexOf(highlight);

    if (highlightIndex === -1) {
        return <p className="problem-section__card-desc">{description}</p>;
    }

    const before = description.slice(0, highlightIndex);
    const after = description.slice(highlightIndex + highlight.length);

    return (
        <p className="problem-section__card-desc">
            {before}
            <span className="problem-section__pill">{highlight}</span>
            {after}
        </p>
    );
}
