<?php

namespace App\Http\Controllers\SchoolAdmin;

use App\Http\Controllers\Controller;
use App\Models\SchoolSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class IntegrationController extends Controller
{
    private function sid(): int
    {
        return $this->getSchoolId();
    }

    public function index()
    {
        $sid      = $this->sid();
        $settings = SchoolSetting::allFor($sid);

        return Inertia::render('SchoolAdmin/Settings/Integrations', [
            'smtp' => [
                'host'       => $settings['smtp_host']       ?? '',
                'port'       => $settings['smtp_port']       ?? '587',
                'username'   => $settings['smtp_username']   ?? '',
                'password'   => $settings['smtp_password']   ?? '',   // masked on render
                'encryption' => $settings['smtp_encryption'] ?? 'tls',
                'from_name'  => $settings['smtp_from_name']  ?? '',
                'from_email' => $settings['smtp_from_email'] ?? '',
            ],
            'sms' => [
                'provider'    => $settings['sms_provider']    ?? 'twilio',
                'account_sid' => $settings['sms_account_sid'] ?? '',
                'auth_token'  => $settings['sms_auth_token']  ?? '',  // masked
                'from_number' => $settings['sms_from_number'] ?? '',
                'api_key'     => $settings['sms_api_key']     ?? '',  // Vonage key
                'api_secret'  => $settings['sms_api_secret']  ?? '',  // masked
                'sender_id'   => $settings['sms_sender_id']   ?? '',
            ],
        ]);
    }

    // ── SMTP ──────────────────────────────────────────────────────

    public function saveSmtp(Request $request)
    {
        $data = $request->validate([
            'host'       => 'required|string|max:255',
            'port'       => 'required|integer|min:1|max:65535',
            'username'   => 'required|string|max:255',
            'password'   => 'nullable|string|max:255',
            'encryption' => 'required|in:tls,ssl,none',
            'from_name'  => 'required|string|max:100',
            'from_email' => 'required|email|max:255',
        ]);

        $sid = $this->sid();
        foreach ($data as $key => $value) {
            if ($key === 'password' && blank($value)) continue; // keep existing password
            SchoolSetting::set($sid, 'smtp_' . $key, $value, 'smtp');
        }

        return back()->with('success', 'SMTP settings saved.');
    }

    public function testSmtp(Request $request)
    {
        $request->validate(['test_email' => 'required|email']);
        $sid      = $this->sid();
        $settings = SchoolSetting::allFor($sid);

        try {
            // Temporarily configure mailer with school settings
            config([
                'mail.mailers.smtp.host'       => $settings['smtp_host']       ?? config('mail.mailers.smtp.host'),
                'mail.mailers.smtp.port'        => $settings['smtp_port']       ?? config('mail.mailers.smtp.port'),
                'mail.mailers.smtp.username'    => $settings['smtp_username']   ?? config('mail.mailers.smtp.username'),
                'mail.mailers.smtp.password'    => $settings['smtp_password']   ?? config('mail.mailers.smtp.password'),
                'mail.mailers.smtp.encryption'  => $settings['smtp_encryption'] ?? config('mail.mailers.smtp.encryption'),
                'mail.from.address'             => $settings['smtp_from_email'] ?? config('mail.from.address'),
                'mail.from.name'                => $settings['smtp_from_name']  ?? config('mail.from.name'),
            ]);

            Mail::raw('This is a test email from Genius SMS to verify your SMTP configuration.', function ($msg) use ($request, $settings) {
                $msg->to($request->test_email)
                    ->subject('Genius SMS — SMTP Test')
                    ->from($settings['smtp_from_email'] ?? config('mail.from.address'), $settings['smtp_from_name'] ?? 'Genius SMS');
            });

            return back()->with('success', 'Test email sent to ' . $request->test_email);
        } catch (\Throwable $e) {
            return back()->with('error', 'SMTP test failed: ' . $e->getMessage());
        }
    }

    // ── SMS ───────────────────────────────────────────────────────

    public function saveSms(Request $request)
    {
        $data = $request->validate([
            'provider'    => 'required|in:twilio,vonage',
            'account_sid' => 'nullable|string|max:255',
            'auth_token'  => 'nullable|string|max:255',
            'from_number' => 'nullable|string|max:20',
            'api_key'     => 'nullable|string|max:255',
            'api_secret'  => 'nullable|string|max:255',
            'sender_id'   => 'nullable|string|max:20',
        ]);

        $sid = $this->sid();
        foreach ($data as $key => $value) {
            // Skip blank secrets — keep existing values
            if (in_array($key, ['auth_token', 'api_secret']) && blank($value)) continue;
            SchoolSetting::set($sid, 'sms_' . $key, $value, 'sms');
        }

        return back()->with('success', 'SMS gateway settings saved.');
    }

    public function testSms(Request $request)
    {
        $request->validate(['test_phone' => 'required|string|min:7|max:20']);
        $sid      = $this->sid();
        $settings = SchoolSetting::allFor($sid);
        $provider = $settings['sms_provider'] ?? 'twilio';

        try {
            if ($provider === 'twilio') {
                // Stub: would use Twilio SDK
                // $client = new \Twilio\Rest\Client($settings['sms_account_sid'], $settings['sms_auth_token']);
                // $client->messages->create($request->test_phone, ['from' => $settings['sms_from_number'], 'body' => 'Test SMS from Genius SMS.']);
                throw new \RuntimeException('Twilio SDK not installed. Add twilio/sdk to composer.json.');
            } else {
                // Stub: would use Vonage SDK
                throw new \RuntimeException('Vonage SDK not installed. Add vonage/client to composer.json.');
            }
        } catch (\Throwable $e) {
            return back()->with('error', 'SMS test failed: ' . $e->getMessage());
        }
    }
}
