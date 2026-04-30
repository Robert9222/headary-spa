<?php

use App\Http\Controllers\Api\GalleryFilesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\PageSectionController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\TranslationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('api')->group(function () {
    // Auth endpoints
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::post('auth/change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');

    // Public endpoints
    Route::apiResource('services', ServiceController::class)->only(['index', 'show']);
    Route::apiResource('employees', EmployeeController::class)->only(['index', 'show']);
    Route::apiResource('packages', PackageController::class)->only(['index', 'show']);
    Route::apiResource('gallery', GalleryController::class)->only(['index', 'show']);
    Route::get('settings', [SettingController::class, 'getPublic']);
    Route::get('settings/{key}', [SettingController::class, 'get']);
    Route::post('appointments', [AppointmentController::class, 'store']); // Rezerwacja online
    Route::post('voucher', [VoucherController::class, 'send']); // Voucher order
    Route::apiResource('reviews', ReviewController::class)->only(['index', 'show']);

    // Page sections (public)
    Route::get('pages/{pageKey}/sections', [PageSectionController::class, 'indexByPage']);

    // Admin endpoints (protected by auth:sanctum + admin)
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        // Services management
        Route::apiResource('services', ServiceController::class)->only(['store', 'update', 'destroy']);

        // Appointments management
        Route::apiResource('appointments', AppointmentController::class)->only(['index', 'show', 'update', 'destroy']);

        // Employees management
        Route::apiResource('employees', EmployeeController::class)->only(['store', 'update', 'destroy']);

        // Packages management
        Route::apiResource('packages', PackageController::class)->only(['store', 'update', 'destroy']);

        // Gallery management
        Route::apiResource('gallery', GalleryController::class)->only(['store', 'update', 'destroy']);

        // Settings management
        Route::post('settings', [SettingController::class, 'store']);
        Route::put('settings/{key}', [SettingController::class, 'update']);
        Route::delete('settings/{key}', [SettingController::class, 'destroy']);

        // Reviews management
        Route::apiResource('reviews', ReviewController::class)->only(['store', 'update', 'destroy']);

        // Page sections management
        Route::get('admin/pages/{pageKey}/sections', [PageSectionController::class, 'adminIndexByPage']);
        Route::post('page-sections', [PageSectionController::class, 'store']);
        Route::get('page-sections/{pageSection}', [PageSectionController::class, 'show']);
        Route::put('page-sections/{pageSection}', [PageSectionController::class, 'update']);
        Route::delete('page-sections/{pageSection}', [PageSectionController::class, 'destroy']);
        Route::post('page-sections/reorder', [PageSectionController::class, 'reorder']);
        Route::post('page-sections/upload-image', [PageSectionController::class, 'uploadImage']);

        // Generic image upload (gallery, services, employees avatars...)
        Route::post('admin/upload-image', [UploadController::class, 'image']);

        // Gallery files (file-based manager for /storage/images directory)
        Route::get('admin/gallery/files', [GalleryFilesController::class, 'index']);
        Route::post('admin/gallery/files', [GalleryFilesController::class, 'store']);
        Route::delete('admin/gallery/files/{name}', [GalleryFilesController::class, 'destroy'])
            ->where('name', '[A-Za-z0-9_\-\.]+');

        // Auto translation (MyMemory proxy)
        Route::post('admin/translate', [TranslationController::class, 'translate']);
    });
});
