<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            // Required from the home page's popups ("What should we build?" and the game) only.
            'phone' => ['nullable', 'required_if:source,home-planner,home-game', 'string', 'max:40', 'regex:/^[0-9+()\-.\s]{6,40}$/'],
            'company' => ['nullable', 'string', 'max:160'],
            'message' => ['required', 'string', 'max:5000'],
            'source' => ['nullable', 'string', 'max:120'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required_if' => 'Please add a phone number.',
            'phone.regex' => 'Please enter a valid phone number.',
        ];
    }
}
