<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VoucherConfirmationMail;
use App\Mail\VoucherOrderMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class VoucherController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate([
            'sender_name' => 'required|string|max:255',
            'sender_email' => 'required|email|max:255',
            'sender_phone' => 'required|string|max:50',
            'recipient_name' => 'required|string|max:255',
            'message' => 'nullable|string|max:1000',
            'treatment' => 'required|string|max:255',
        ]);

        // Odbiorca powiadomienia — konfigurowalny przez .env (VOUCHER_NOTIFY_EMAIL).
        // Testowo domyślnie: robert.krzysztof.talar@gmail.com
        $salonRecipient = config('services.voucher.notify_email');

        // W trybie testowym również potwierdzenie trafia na adres testowy,
        // żeby nie wysyłać maili do obcych skrzynek podczas testów.
        $testMode = (bool) config('services.voucher.test_mode');

        try {
            // 1) Powiadomienie do salonu / adresu testowego
            Mail::to($salonRecipient)->send(new VoucherOrderMail($data));

            // 2) Potwierdzenie do osoby zamawiającej
            $confirmationRecipient = $testMode ? $salonRecipient : $data['sender_email'];
            Mail::to($confirmationRecipient)->send(new VoucherConfirmationMail($data));
        } catch (\Throwable $e) {
            Log::error('Voucher mail send failed: ' . $e->getMessage(), [
                'exception' => $e,
                'data' => $data,
            ]);

            return response()->json([
                'message' => 'Nie udało się wysłać vouchera. Spróbuj ponownie później.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        return response()->json([
            'message' => 'Voucher wysłany pomyślnie',
            'sent_to' => $salonRecipient,
        ], 200);
    }
}

