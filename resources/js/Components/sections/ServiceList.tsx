import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import type { Service } from '../../types';
import { SectionHeader } from './SectionHeader';

type ServiceListProps = {
    services: Service[];
};

const VISUALS = [
    (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="service-card__art-svg">
            <path d="M38 118 L100 82 L162 118 L100 154 Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M38 118 L38 88 L100 52 L100 82" stroke="currentColor" strokeWidth="1.5" />
            <path d="M100 82 L162 118 L162 88 L100 52" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
            <path d="M52 104 L100 76 L148 104 L100 132 Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M52 104 L52 78 L100 50 L100 76" stroke="currentColor" strokeWidth="1.5" />
            <path d="M100 76 L148 104 L148 78 L100 50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
            <path d="M66 90 L100 68 L134 90 L100 112 Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M66 90 L66 70 L100 48 L100 68" stroke="currentColor" strokeWidth="1.5" />
            <path d="M100 68 L134 90 L134 70 L100 48" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        </svg>
    ),
    (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="service-card__art-svg">
            <ellipse cx="100" cy="138" rx="52" ry="14" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
            <ellipse cx="100" cy="100" rx="54" ry="54" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="100" cy="100" rx="54" ry="54" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 6" />
            <path d="M46 100 Q100 46 154 100" stroke="currentColor" strokeWidth="1.2" />
            <path d="M46 100 Q100 154 154 100" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" />
            <ellipse cx="100" cy="88" rx="38" ry="10" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
        </svg>
    ),
    (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="service-card__art-svg">
            <ellipse cx="100" cy="100" rx="62" ry="28" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="100" cy="100" rx="42" ry="18" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
            <ellipse cx="100" cy="100" rx="62" ry="28" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" transform="rotate(58 100 100)" />
            <ellipse cx="100" cy="100" rx="48" ry="22" stroke="currentColor" strokeWidth="1.2" transform="rotate(-32 100 100)" />
        </svg>
    )
];

export function ServiceList({ services }: ServiceListProps) {
    const displayServices = services.slice(0, 3);

    return (
        <section className="services-section" data-reveal>
            <div className="services-section__bg">
                <div className="services-section__glow" aria-hidden="true" />
                <div className="services-section__grid-pattern" aria-hidden="true" />
            </div>
            
            <div className="services-section__inner">
                <SectionHeader
                    index="03"
                    label="Services"
                    title={
                        <>
                            <span className="section-head__title-line">How we manage</span>
                            <span className="section-head__title-line">your network efficiently</span>
                        </>
                    }
                    kicker="We leverage advanced analytics and automation to boost performance, minimize downtime, and keep your network running smoothly."
                />
                
                <div className="services-section__grid-3col">
                    {displayServices.map((service, index) => (
                        <motion.article 
                            key={service.slug}
                            className="service-card-light"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="service-card-light__art">
                                {VISUALS[index]}
                            </div>
                            <div className="service-card-light__content">
                                <h3 className="service-card-light__title">{service.name}</h3>
                                <p className="service-card-light__summary">{service.summary}</p>
                                <Link href={`/services/${service.slug}`} className="service-card-light__link">
                                    Read more
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
