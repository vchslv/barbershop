<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AppointmentBookingTest extends TestCase
{
    use RefreshDatabase;

    private Barber $barber;
    private Service $service;
    private User $client;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(Carbon::parse('2026-11-02 14:10:00'));

        $this->barber = Barber::create(['name' => 'Alex', 'is_active' => true]);
        $this->service = Service::create(['name' => 'Cut', 'duration_minutes' => 30, 'price' => 10]);
        $this->client = User::create([
            'name' => 'Client',
            'email' => 'c@client.barbershop',
            'phone' => '+79991234567',
            'password' => 'secret123',
            'role' => User::ROLE_CLIENT,
        ]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function book(array $overrides = []): \Illuminate\Testing\TestResponse
    {
        return $this->postJson('/api/appointments', array_merge([
            'barber_id' => $this->barber->id,
            'service_id' => $this->service->id,
            'client_name' => 'Client',
            'client_phone' => '+79991234567',
            'date' => '2026-11-02',
            'start_time' => '15:00',
        ], $overrides));
    }

    public function test_slots_for_today_skip_past_times(): void
    {
        $slots = $this->getJson('/api/appointments/slots?'.http_build_query([
            'date' => '2026-11-02',
            'barber_id' => $this->barber->id,
            'service_id' => $this->service->id,
        ]))->assertOk()->json('slots');

        $this->assertSame('14:30', $slots[0]);
        $this->assertNotContains('14:00', $slots);
    }

    public function test_booking_in_the_past_is_rejected(): void
    {
        Sanctum::actingAs($this->client);

        $this->book(['start_time' => '11:00'])
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'slot_in_past');

        $this->book()->assertCreated();
    }

    public function test_overlapping_booking_is_rejected(): void
    {
        Sanctum::actingAs($this->client);

        $this->book()->assertCreated();
        $this->book()->assertStatus(422)->assertJsonPath('error_code', 'slot_taken');
    }

    public function test_inactive_barber_cannot_be_booked(): void
    {
        Sanctum::actingAs($this->client);
        $this->barber->update(['is_active' => false]);

        $this->book()->assertStatus(422)->assertJsonValidationErrors('barber_id');
    }

    public function test_client_sees_and_cancels_only_own_appointments(): void
    {
        $other = User::create([
            'name' => 'Other',
            'email' => 'o@client.barbershop',
            'phone' => '+79990000000',
            'password' => 'secret123',
            'role' => User::ROLE_CLIENT,
        ]);

        Sanctum::actingAs($this->client);
        $mine = $this->book()->json('id');

        Sanctum::actingAs($other);
        $theirs = $this->book(['start_time' => '16:00'])->json('id');
        $this->postJson("/api/my/appointments/{$mine}/cancel")->assertNotFound();

        Sanctum::actingAs($this->client);
        $this->getJson('/api/my/appointments')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $mine);

        $this->postJson("/api/my/appointments/{$mine}/cancel")->assertOk();
        $this->assertSame('cancelled', Appointment::find($mine)->status);
        $this->assertSame('confirmed', Appointment::find($theirs)->status);

        $this->postJson("/api/my/appointments/{$mine}/cancel")
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'already_cancelled');
    }

    public function test_started_appointment_cannot_be_cancelled_by_client(): void
    {
        $appointment = Appointment::create([
            'user_id' => $this->client->id,
            'barber_id' => $this->barber->id,
            'service_id' => $this->service->id,
            'client_name' => 'Client',
            'client_phone' => '+79991234567',
            'date' => '2026-11-02',
            'start_time' => '14:00:00',
            'end_time' => '14:30:00',
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($this->client);

        $this->postJson("/api/my/appointments/{$appointment->id}/cancel")
            ->assertStatus(422)
            ->assertJsonPath('error_code', 'appointment_started');
    }

    public function test_phone_formats_map_to_the_same_account(): void
    {
        $this->postJson('/api/login', ['phone' => '8 (999) 123-45-67', 'password' => 'secret123'])->assertOk();
        $this->postJson('/api/login', ['phone' => '+7 999 123 45 67', 'password' => 'secret123'])->assertOk();

        $this->postJson('/api/register', ['name' => 'Dup', 'phone' => '89991234567', 'password' => 'secret123'])
            ->assertStatus(422)
            ->assertJsonPath('errors.phone.0', 'phone_taken');

        $this->postJson('/api/register', ['name' => 'Bad', 'phone' => '12-34', 'password' => 'secret123'])
            ->assertStatus(422)
            ->assertJsonPath('errors.phone.0', 'phone_invalid');
    }
}
