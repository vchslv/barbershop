<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

class AppointmentController extends Controller
{
    private const WORK_START = '10:00';
    private const WORK_END = '20:00';
    private const SLOT_STEP_MINUTES = 30;
    private const TRANSACTION_ATTEMPTS = 3;

    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with(['barber', 'service'])
            ->orderBy('date')
            ->orderBy('start_time');

        if ($request->filled('date')) {
            $query->whereDate('date', $request->string('date'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->get());
    }

    public function myIndex(Request $request): JsonResponse
    {
        $query = Appointment::with(['barber', 'service'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('date')
            ->orderByDesc('start_time');

        if ($request->filled('date')) {
            $query->whereDate('date', $request->string('date'));
        }

        return response()->json($query->get());
    }

    public function show(Appointment $appointment): JsonResponse
    {
        $appointment->load(['barber', 'service']);

        return response()->json($appointment);
    }

    public function availableSlots(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'barber_id' => ['required', $this->activeBarberRule()],
            'service_id' => ['required', 'exists:services,id'],
            'exclude_appointment_id' => ['nullable', 'exists:appointments,id'],
        ]);

        $service = Service::findOrFail($validated['service_id']);
        $date = Carbon::parse($validated['date'])->toDateString();
        $excludeId = $validated['exclude_appointment_id'] ?? null;

        $bookedQuery = Appointment::query()
            ->where('barber_id', $validated['barber_id'])
            ->whereDate('date', $date)
            ->where('status', '!=', 'cancelled');

        if ($excludeId) {
            $bookedQuery->where('id', '!=', $excludeId);
        }

        $booked = $bookedQuery->get(['start_time', 'end_time']);

        $slots = [];
        $now = now();
        $cursor = Carbon::parse($date.' '.self::WORK_START);
        $dayEnd = Carbon::parse($date.' '.self::WORK_END);

        while ($cursor->copy()->addMinutes($service->duration_minutes)->lte($dayEnd)) {
            $slotStart = $cursor->format('H:i');
            $slotEnd = $cursor->copy()->addMinutes($service->duration_minutes)->format('H:i');

            $overlaps = $booked->contains(function (Appointment $appointment) use ($slotStart, $slotEnd) {
                $bookedStart = Carbon::parse($appointment->start_time)->format('H:i');
                $bookedEnd = Carbon::parse($appointment->end_time)->format('H:i');

                return $slotStart < $bookedEnd && $slotEnd > $bookedStart;
            });

            if (!$overlaps && $cursor->gt($now)) {
                $slots[] = $slotStart;
            }

            $cursor->addMinutes(self::SLOT_STEP_MINUTES);
        }

        return response()->json([
            'date' => $date,
            'duration_minutes' => $service->duration_minutes,
            'slots' => $slots,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'barber_id' => ['required', $this->activeBarberRule()],
            'service_id' => ['required', 'exists:services,id'],
            'client_name' => ['required', 'string', 'max:100'],
            'client_phone' => ['required', 'string', 'max:30'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
        ]);

        $userId = $request->user()->id;

        return DB::transaction(function () use ($validated, $userId): JsonResponse {
            $this->lockBarber((int) $validated['barber_id']);

            $scheduleError = $this->validateSchedule(
                (int) $validated['barber_id'],
                (int) $validated['service_id'],
                $validated['date'],
                $validated['start_time']
            );

            if ($scheduleError !== null) {
                return $scheduleError;
            }

            [$date, $start, $end] = $this->resolveTimes(
                (int) $validated['service_id'],
                $validated['date'],
                $validated['start_time']
            );

            $appointment = Appointment::create([
                'user_id' => $userId,
                'barber_id' => $validated['barber_id'],
                'service_id' => $validated['service_id'],
                'client_name' => $validated['client_name'],
                'client_phone' => $validated['client_phone'],
                'date' => $date,
                'start_time' => $start->format('H:i:s'),
                'end_time' => $end->format('H:i:s'),
                'status' => 'confirmed',
            ]);

            $appointment->load(['barber', 'service', 'user']);

            return response()->json($appointment, 201);
        }, self::TRANSACTION_ATTEMPTS);
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'barber_id' => ['required', 'exists:barbers,id'],
            'service_id' => ['required', 'exists:services,id'],
            'client_name' => ['required', 'string', 'max:100'],
            'client_phone' => ['required', 'string', 'max:30'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'status' => ['required', 'in:confirmed,cancelled'],
        ]);

        return DB::transaction(function () use ($validated, $appointment): JsonResponse {
            if ($validated['status'] !== 'cancelled') {
                $this->lockBarber((int) $validated['barber_id']);

                $timeChanged = $appointment->date->toDateString() !== Carbon::parse($validated['date'])->toDateString()
                    || Carbon::parse($appointment->start_time)->format('H:i') !== $validated['start_time'];

                $scheduleError = $this->validateSchedule(
                    (int) $validated['barber_id'],
                    (int) $validated['service_id'],
                    $validated['date'],
                    $validated['start_time'],
                    $appointment->id,
                    $timeChanged
                );

                if ($scheduleError !== null) {
                    return $scheduleError;
                }
            }

            [$date, $start, $end] = $this->resolveTimes(
                (int) $validated['service_id'],
                $validated['date'],
                $validated['start_time']
            );

            $appointment->update([
                'barber_id' => $validated['barber_id'],
                'service_id' => $validated['service_id'],
                'client_name' => $validated['client_name'],
                'client_phone' => $validated['client_phone'],
                'date' => $date,
                'start_time' => $start->format('H:i:s'),
                'end_time' => $end->format('H:i:s'),
                'status' => $validated['status'],
            ]);

            $appointment->load(['barber', 'service']);

            return response()->json($appointment);
        }, self::TRANSACTION_ATTEMPTS);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'cancelled',
            'error_code' => null,
        ]);
    }

    public function cancelOwn(Request $request, Appointment $appointment): JsonResponse
    {
        if ((int) $appointment->user_id !== (int) $request->user()->id) {
            abort(404);
        }

        if ($appointment->status === 'cancelled') {
            return $this->errorResponse('already_cancelled');
        }

        $start = Carbon::parse($appointment->date->toDateString().' '.$appointment->start_time);

        if ($start->lte(now())) {
            return $this->errorResponse('appointment_started');
        }

        $appointment->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'cancelled',
            'error_code' => null,
        ]);
    }

    private function validateSchedule(
        int $barberId,
        int $serviceId,
        string $dateInput,
        string $startTime,
        ?int $excludeAppointmentId = null,
        bool $rejectPast = true
    ): ?JsonResponse {
        [$date, $start, $end] = $this->resolveTimes($serviceId, $dateInput, $startTime);

        $workStart = Carbon::parse($date.' '.self::WORK_START);
        $workEnd = Carbon::parse($date.' '.self::WORK_END);

        if ($start->lt($workStart) || $end->gt($workEnd)) {
            return $this->errorResponse('outside_hours', 'start_time');
        }

        if ($rejectPast && $start->lte(now())) {
            return $this->errorResponse('slot_in_past', 'start_time');
        }

        $overlapQuery = Appointment::query()
            ->where('barber_id', $barberId)
            ->whereDate('date', $date)
            ->where('status', '!=', 'cancelled')
            ->where('start_time', '<', $end->format('H:i:s'))
            ->where('end_time', '>', $start->format('H:i:s'));

        if ($excludeAppointmentId !== null) {
            $overlapQuery->where('id', '!=', $excludeAppointmentId);
        }

        if ($overlapQuery->exists()) {
            return $this->errorResponse('slot_taken', 'start_time');
        }

        return null;
    }

    /**
     * @return array{0: string, 1: Carbon, 2: Carbon}
     */
    private function resolveTimes(int $serviceId, string $dateInput, string $startTime): array
    {
        $service = Service::findOrFail($serviceId);
        $date = Carbon::parse($dateInput)->toDateString();
        $start = Carbon::parse($date.' '.$startTime);
        $end = $start->copy()->addMinutes($service->duration_minutes);

        return [$date, $start, $end];
    }

    /**
     * Serializes bookings per barber so the overlap check and the insert
     * can't interleave between two concurrent requests.
     */
    private function lockBarber(int $barberId): void
    {
        Barber::query()->whereKey($barberId)->lockForUpdate()->first();
    }

    private function activeBarberRule(): Exists
    {
        return Rule::exists('barbers', 'id')->where('is_active', true);
    }

    private function errorResponse(string $code, ?string $field = null): JsonResponse
    {
        $body = [
            'message' => $code,
            'error_code' => $code,
        ];

        if ($field !== null) {
            $body['errors'] = [$field => [$code]];
        }

        return response()->json($body, 422);
    }
}
