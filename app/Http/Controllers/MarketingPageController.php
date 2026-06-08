<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class MarketingPageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Home', [
            'services' => $this->serviceCatalog(),
            'featuredProof' => [
                'Case studies',
                'Success stories',
                'Measurable outcomes',
                'Operational systems',
            ],
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('About', [
            'values' => [
                'Integrity',
                'Proficiency',
                'Courage',
                'Intelligence',
                'Mastery',
                'Purpose',
                'Focus',
            ],
        ]);
    }

    public function services(): Response
    {
        return Inertia::render('Services/Index', [
            'services' => $this->serviceCatalog(),
        ]);
    }

    public function service(string $slug): Response
    {
        $service = collect($this->serviceCatalog())->firstWhere('slug', $slug);

        abort_if($service === null, 404);

        return Inertia::render('Services/Show', [
            'service' => $service,
        ]);
    }

    public function work(): Response
    {
        return Inertia::render('Work/Index', [
            'caseStudies' => [],
        ]);
    }

    private function serviceCatalog(): array
    {
        return [
            [
                'slug' => 'ai-engineering-lab',
                'name' => 'AI Engineering Lab',
                'summary' => 'Research and development of advanced AI systems.',
            ],
            [
                'slug' => 'custom-ai-solutions',
                'name' => 'Custom AI Solutions',
                'summary' => 'Bespoke software and AI products built around specific business needs.',
            ],
            [
                'slug' => 'ai-consulting',
                'name' => 'AI Consulting',
                'summary' => 'Strategy, implementation planning, workflow analysis, and opportunity mapping.',
            ],
            [
                'slug' => 'ai-services',
                'name' => 'AI Services',
                'summary' => 'Development, deployment, optimization, and ongoing improvement of AI-powered systems.',
            ],
            [
                'slug' => 'ai-products',
                'name' => 'AI Products',
                'summary' => 'Purpose-built tools that help organizations operate more efficiently.',
            ],
        ];
    }
}
