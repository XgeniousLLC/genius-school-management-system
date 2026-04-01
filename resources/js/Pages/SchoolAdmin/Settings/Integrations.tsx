import AppLayout from '@/Layouts/AppLayout';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, CheckCircle, Send } from 'lucide-react';

interface SmtpSettings {
    host: string; port: string; username: string; password: string;
    encryption: string; from_name: string; from_email: string;
}
interface SmsSettings {
    provider: string; account_sid: string; auth_token: string;
    from_number: string; api_key: string; api_secret: string; sender_id: string;
}
interface Props { smtp: SmtpSettings; sms: SmsSettings; }

export default function Integrations({ smtp, sms }: Props) {
    const [activeTab, setActiveTab] = useState<'smtp' | 'sms'>('smtp');

    const smtpForm = useForm({
        host:       smtp.host,
        port:       smtp.port,
        username:   smtp.username,
        password:   '',  // never pre-fill password
        encryption: smtp.encryption,
        from_name:  smtp.from_name,
        from_email: smtp.from_email,
    });

    const smsForm = useForm({
        provider:    sms.provider || 'twilio',
        account_sid: sms.account_sid,
        auth_token:  '',
        from_number: sms.from_number,
        api_key:     sms.api_key,
        api_secret:  '',
        sender_id:   sms.sender_id,
    });

    const testSmtp = useForm({ test_email: '' });
    const testSms  = useForm({ test_phone: '' });

    function submitSmtp(e: React.FormEvent) {
        e.preventDefault();
        smtpForm.post('/school/settings/integrations/smtp');
    }
    function submitSms(e: React.FormEvent) {
        e.preventDefault();
        smsForm.post('/school/settings/integrations/sms');
    }
    function sendTestEmail(e: React.FormEvent) {
        e.preventDefault();
        testSmtp.post('/school/settings/integrations/smtp/test', { onSuccess: () => testSmtp.reset() });
    }
    function sendTestSms(e: React.FormEvent) {
        e.preventDefault();
        testSms.post('/school/settings/integrations/sms/test', { onSuccess: () => testSms.reset() });
    }

    return (
        <AppLayout title="Integrations">
            <div className="max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Integrations</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Configure email SMTP and SMS gateway for bulk messaging</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
                    <button onClick={() => setActiveTab('smtp')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'smtp' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        <Mail className="w-4 h-4" /> Email (SMTP)
                    </button>
                    <button onClick={() => setActiveTab('sms')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sms' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        <MessageSquare className="w-4 h-4" /> SMS Gateway
                    </button>
                </div>

                {/* SMTP Tab */}
                {activeTab === 'smtp' && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-indigo-500" /> SMTP Configuration</CardTitle>
                                <CardDescription>Used for sending bulk email blasts, fee reminders, and system notifications.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitSmtp} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>SMTP Host *</Label>
                                            <Input value={smtpForm.data.host} onChange={e => smtpForm.setData('host', e.target.value)} placeholder="smtp.gmail.com" />
                                            {smtpForm.errors.host && <p className="text-xs text-red-500 mt-1">{smtpForm.errors.host}</p>}
                                        </div>
                                        <div>
                                            <Label>Port *</Label>
                                            <Input type="number" value={smtpForm.data.port} onChange={e => smtpForm.setData('port', e.target.value)} placeholder="587" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Username *</Label>
                                            <Input value={smtpForm.data.username} onChange={e => smtpForm.setData('username', e.target.value)} placeholder="your@email.com" />
                                        </div>
                                        <div>
                                            <Label>Password</Label>
                                            <Input type="password" value={smtpForm.data.password} onChange={e => smtpForm.setData('password', e.target.value)} placeholder="Leave blank to keep existing" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Encryption *</Label>
                                            <Select value={smtpForm.data.encryption} onValueChange={v => smtpForm.setData('encryption', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tls">TLS (Recommended)</SelectItem>
                                                    <SelectItem value="ssl">SSL</SelectItem>
                                                    <SelectItem value="none">None</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>From Name *</Label>
                                            <Input value={smtpForm.data.from_name} onChange={e => smtpForm.setData('from_name', e.target.value)} placeholder="Genius School" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>From Email *</Label>
                                        <Input type="email" value={smtpForm.data.from_email} onChange={e => smtpForm.setData('from_email', e.target.value)} placeholder="noreply@school.com" />
                                    </div>
                                    <Button type="submit" disabled={smtpForm.processing} className="gap-2">
                                        <CheckCircle className="w-4 h-4" /> Save SMTP Settings
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Test SMTP */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Send Test Email</CardTitle>
                                <CardDescription>Verify your SMTP settings by sending a test email.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={sendTestEmail} className="flex gap-3">
                                    <div className="flex-1">
                                        <Input type="email" value={testSmtp.data.test_email}
                                            onChange={e => testSmtp.setData('test_email', e.target.value)}
                                            placeholder="recipient@example.com" />
                                        {testSmtp.errors.test_email && <p className="text-xs text-red-500 mt-1">{testSmtp.errors.test_email}</p>}
                                    </div>
                                    <Button type="submit" variant="outline" disabled={testSmtp.processing} className="gap-2">
                                        <Send className="w-4 h-4" /> Send Test
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* SMS Tab */}
                {activeTab === 'sms' && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-green-500" /> SMS Gateway Configuration</CardTitle>
                                <CardDescription>Configure Twilio or Vonage for sending bulk SMS to parents and students.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitSms} className="space-y-4">
                                    <div>
                                        <Label>SMS Provider *</Label>
                                        <div className="flex gap-3 mt-2">
                                            {(['twilio', 'vonage'] as const).map(p => (
                                                <button key={p} type="button"
                                                    onClick={() => smsForm.setData('provider', p)}
                                                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors capitalize ${smsForm.data.provider === p ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700'}`}>
                                                    {p === 'twilio' ? '🔵 Twilio' : '🟠 Vonage'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {smsForm.data.provider === 'twilio' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Account SID</Label>
                                                    <Input value={smsForm.data.account_sid} onChange={e => smsForm.setData('account_sid', e.target.value)} placeholder="ACxxxxxxxxxxxxxxxx" />
                                                </div>
                                                <div>
                                                    <Label>Auth Token</Label>
                                                    <Input type="password" value={smsForm.data.auth_token} onChange={e => smsForm.setData('auth_token', e.target.value)} placeholder="Leave blank to keep existing" />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>From Number</Label>
                                                <Input value={smsForm.data.from_number} onChange={e => smsForm.setData('from_number', e.target.value)} placeholder="+1234567890" />
                                            </div>
                                        </>
                                    )}

                                    {smsForm.data.provider === 'vonage' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>API Key</Label>
                                                    <Input value={smsForm.data.api_key} onChange={e => smsForm.setData('api_key', e.target.value)} placeholder="Vonage API Key" />
                                                </div>
                                                <div>
                                                    <Label>API Secret</Label>
                                                    <Input type="password" value={smsForm.data.api_secret} onChange={e => smsForm.setData('api_secret', e.target.value)} placeholder="Leave blank to keep existing" />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Sender ID</Label>
                                                <Input value={smsForm.data.sender_id} onChange={e => smsForm.setData('sender_id', e.target.value)} placeholder="YourSchool (max 11 chars)" maxLength={11} />
                                            </div>
                                        </>
                                    )}

                                    <Button type="submit" disabled={smsForm.processing} className="gap-2">
                                        <CheckCircle className="w-4 h-4" /> Save SMS Settings
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Test SMS */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Send Test SMS</CardTitle>
                                <CardDescription>Send a test SMS to verify your gateway configuration.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={sendTestSms} className="flex gap-3">
                                    <div className="flex-1">
                                        <Input value={testSms.data.test_phone}
                                            onChange={e => testSms.setData('test_phone', e.target.value)}
                                            placeholder="+1234567890" />
                                        {testSms.errors.test_phone && <p className="text-xs text-red-500 mt-1">{testSms.errors.test_phone}</p>}
                                    </div>
                                    <Button type="submit" variant="outline" disabled={testSms.processing} className="gap-2">
                                        <Send className="w-4 h-4" /> Send Test
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
