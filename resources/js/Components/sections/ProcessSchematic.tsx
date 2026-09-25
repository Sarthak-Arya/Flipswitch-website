type Node = { id: string; label: string; x: number; y: number; w: number; h: number; core?: boolean };

// A small AI system: three sources feed a core that powers a dashboard and the team.
const NODES: Node[] = [
    { id: 'email', label: 'Email', x: 18, y: 48, w: 104, h: 44 },
    { id: 'crm', label: 'CRM', x: 18, y: 168, w: 104, h: 44 },
    { id: 'docs', label: 'Docs', x: 18, y: 288, w: 104, h: 44 },
    { id: 'core', label: 'AI core', x: 204, y: 146, w: 112, h: 88, core: true },
    { id: 'dashboard', label: 'Dashboard', x: 392, y: 88, w: 116, h: 44 },
    { id: 'team', label: 'Your team', x: 392, y: 248, w: 116, h: 44 },
];

// `slice`: the one workflow the prototype runs end to end (email in, dashboard out).
const LINKS = [
    { d: 'M122,70 C168,70 158,170 204,170', slice: true },
    { d: 'M122,190 H204' },
    { d: 'M122,310 C168,310 158,210 204,210' },
    { d: 'M316,170 C356,170 352,110 392,110', slice: true },
    { d: 'M316,210 C356,210 352,270 392,270' },
];

// A rough hand-drawn loop around a node, for the sketch stage.
const sketch = ({ x, y, w, h }: Node) => {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2 + 6;
    const ry = h / 2 + 5;

    return `M${cx - rx},${cy + 2} C${cx - rx},${cy - ry - 3} ${cx + rx + 4},${cy - ry + 1} ${cx + rx},${cy - 1} C${cx + rx - 2},${cy + ry + 2} ${cx - rx + 3},${cy + ry + 1} ${cx - rx + 6},${cy - 4}`;
};

type ProcessSchematicProps = {
    // How many steps are done: 1 sketch, 2 blueprint, 3 prototype, 4 tested, 5 live.
    stage: number;
};

// "How it works": the system the steps produce, drawn in whatever state it has
// reached. It goes from a pencil sketch (Discovery) to a blueprint
// (Architecture), a working slice (Prototype), a tested build with every part
// ticked (Build), and finally live, glowing blue with data flowing (Launch).
export function ProcessSchematic({ stage }: ProcessSchematicProps) {
    const reached = Array.from({ length: 5 }, (_, i) => (stage > i ? ` reach-${i + 1}` : '')).join('');

    return (
        <svg className={`schem${reached}`} viewBox="0 0 520 380" role="img" aria-label="The system at this stage">
            <defs>
                <pattern id="schem-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M20,0 H0 V20" fill="none" />
                </pattern>
            </defs>

            <rect className="schem__grid" width="520" height="380" fill="url(#schem-grid)" />

            {LINKS.map((link, i) => (
                <g key={i} className={`schem__link${link.slice ? ' is-slice' : ''}`}>
                    <path className="schem__wire" d={link.d} />
                    <path className="schem__flow" d={link.d} style={{ animationDelay: `${i * -0.3}s` }} />
                </g>
            ))}

            {NODES.map((node) => (
                <g key={node.id} className={`schem__node${node.core ? ' is-core' : ''}`}>
                    <path className="schem__sketch" d={sketch(node)} />
                    <rect
                        className="schem__box"
                        x={node.x}
                        y={node.y}
                        width={node.w}
                        height={node.h}
                        rx={node.core ? 16 : 10}
                    />
                    <text className="schem__label" x={node.x + node.w / 2} y={node.y + node.h / 2}>
                        {node.label}
                    </text>
                    <g className="schem__tick" transform={`translate(${node.x + node.w - 4} ${node.y + 4})`}>
                        <circle r="8" />
                        <path d="M-3.5,0 L-1,2.5 L3.5,-2.5" />
                    </g>
                </g>
            ))}

            <text className="schem__question" x="330" y="140">
                ?
            </text>
            <text className="schem__version" x="260" y="258">
                v0.1
            </text>

            <g className="schem__live" transform="translate(452 30)">
                <rect x="-38" y="-13" width="76" height="26" rx="13" />
                <circle className="schem__live-dot" cx="-22" cy="0" r="4" />
                <text x="6" y="0">
                    LIVE
                </text>
            </g>
        </svg>
    );
}
