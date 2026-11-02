<?php

use App\Support\Phone;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $users = DB::table('users')->whereNotNull('phone')->orderBy('id')->get(['id', 'phone']);

        foreach ($users as $user) {
            $normalized = Phone::normalize($user->phone);

            if ($normalized === null || $normalized === $user->phone) {
                continue;
            }

            $taken = DB::table('users')
                ->where('phone', $normalized)
                ->where('id', '!=', $user->id)
                ->exists();

            if (!$taken) {
                DB::table('users')->where('id', $user->id)->update(['phone' => $normalized]);
            }
        }
    }

    public function down(): void
    {
    }
};
