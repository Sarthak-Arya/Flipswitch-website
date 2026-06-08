<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactSubmissionRequest;
use App\Models\ContactSubmission;
use Illuminate\Http\RedirectResponse;

class ContactSubmissionController extends Controller
{
    public function create()
    {
        return inertia('Contact');
    }

    public function store(StoreContactSubmissionRequest $request): RedirectResponse
    {
        ContactSubmission::create($request->validated());

        return back()->with('success', 'Thanks. We will review your message and get back to you.');
    }
}
