<?php

namespace App\Support;

class Phone
{
    /**
     * Brings a phone to the "+<digits>" form so that "8 999 123-45-67",
     * "+7 (999) 123 45 67" and "79991234567" map to the same account.
     * Returns null when the input cannot be a phone number.
     */
    public static function normalize(string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if (strlen($digits) === 11 && str_starts_with($digits, '8')) {
            $digits = '7'.substr($digits, 1);
        }

        if (strlen($digits) < 10 || strlen($digits) > 15) {
            return null;
        }

        return '+'.$digits;
    }
}
