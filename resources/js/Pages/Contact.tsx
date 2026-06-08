import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { PageHero } from '../Components/sections/PageHero';
import { MarketingLayout } from '../Layouts/MarketingLayout';
import type { SharedPageProps } from '../types';

export default function Contact() {
    const { flash } = usePage<SharedPageProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        company: '',
        message: '',
        source: 'website',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post('/contact', {
            onSuccess: () => reset('name', 'email', 'company', 'message'),
        });
    }

    return (
        <MarketingLayout>
            <Head title="Contact" />

            <PageHero
                eyebrow="Contact"
                title="Start with clarity before implementation."
                summary="Tell us what you are trying to improve. We will help determine what is worth building."
            />

            <section className="page-section" data-reveal>
                {flash?.success ? <p role="status">{flash.success}</p> : null}

                <form onSubmit={submit}>
                    <label>
                        Name
                        <input value={data.name} onChange={(event) => setData('name', event.target.value)} />
                        {errors.name ? <span>{errors.name}</span> : null}
                    </label>

                    <label>
                        Email
                        <input
                            type="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                        />
                        {errors.email ? <span>{errors.email}</span> : null}
                    </label>

                    <label>
                        Company
                        <input
                            value={data.company}
                            onChange={(event) => setData('company', event.target.value)}
                        />
                        {errors.company ? <span>{errors.company}</span> : null}
                    </label>

                    <label>
                        Message
                        <textarea
                            value={data.message}
                            onChange={(event) => setData('message', event.target.value)}
                        />
                        {errors.message ? <span>{errors.message}</span> : null}
                    </label>

                    <button type="submit" disabled={processing}>
                        {processing ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </section>
        </MarketingLayout>
    );
}
