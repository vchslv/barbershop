<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use Illuminate\Http\JsonResponse;

class BarberController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Barber::query()->where('is_active', true)->orderBy('name')->get()
        );
    }
}
