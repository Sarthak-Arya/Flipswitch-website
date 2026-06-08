<?php

use App\Http\Controllers\ContactSubmissionController;
use App\Http\Controllers\MarketingPageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MarketingPageController::class, 'home'])->name('home');
Route::get('/about', [MarketingPageController::class, 'about'])->name('about');

Route::get('/services', [MarketingPageController::class, 'services'])->name('services.index');
Route::get('/services/{slug}', [MarketingPageController::class, 'service'])->name('services.show');

Route::get('/work', [MarketingPageController::class, 'work'])->name('work.index');

Route::get('/contact', [ContactSubmissionController::class, 'create'])->name('contact.create');
Route::post('/contact', [ContactSubmissionController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('contact.store');
