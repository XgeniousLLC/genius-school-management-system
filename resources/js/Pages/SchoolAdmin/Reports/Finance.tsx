import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Filter, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

interface Payment {
    id: number; total_amount: number; amount_paid: number; status: string; paid_at?: string;
    student?: { first_name: string; last_name: string; admission_no: string };
}
interface Paginated { data: Payment[]; total: number; last_page: number; links: { url: string | null; label: string; active: boolean }[]; }
interface Props {
    collected:   number;
    outstanding: number;
    payroll:     number;
    dailyChart:  { day: string; amount: number }[];
    payments:    Paginated;
    filters:     { from_date: string; to_date: string };
}

const statusColor: Record<string, 'default' | 'secondary' | 'destructive'> = {
    paid: 'default', pending: 'secondary', partial: 'secondary', overdue: 'destructive',
};

export default function FinanceReport({ collected, outstanding, payroll, dailyChart, payments, filters }: Props) {
    const [fromDate, setFromDate] = useState(filters.from_date ?? '');
    const [toDate, setToDate]     = useState(filters.to_date ?? '');

    const fmt = (n: number) => new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(n);

    function applyFilter() {
        router.get('/school/reports/finance', { from_date: fromDate, to_date: toDate }, { preserveState: true });
    }
    function exportPdf() {
        window.open(`/school/reports/finance/export-pdf?from_date=${fromDate}&to_date=${toDate}`);
    }

    return (
        <AppLayout title="Finance Report">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finance Report</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Fee collection and financial summary</p>
                    </div>
                    <Button variant="outline" onClick={exportPdf} className="gap-2">
                        <Download className="w-4 h-4" /> Export PDF
                    </Button>
                </div>

                {/* Date Filter */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex gap-3 items-end">
                            <div className="w-36">
                                <Label className="text-xs mb-1 block">From</Label>
                                <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                            </div>
                            <div className="w-36">
                                <Label className="text-xs mb-1 block">To</Label>
                                <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                            </div>
                            <Button onClick={applyFilter} className="gap-2"><Filter className="w-4 h-4" /> Filter</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="pt-5 pb-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Collected (Period)</p>
                                    <p className="text-2xl font-bold mt-1 text-green-600">${fmt(collected)}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-green-500"><TrendingUp className="w-6 h-6 text-white" /></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Outstanding</p>
                                    <p className="text-2xl font-bold mt-1 text-orange-500">${fmt(outstanding)}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-orange-500"><AlertCircle className="w-6 h-6 text-white" /></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 pb-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Payroll (This Month)</p>
                                    <p className="text-2xl font-bold mt-1">${fmt(payroll)}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-blue-500"><DollarSign className="w-6 h-6 text-white" /></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Collection Chart */}
                {dailyChart.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Daily Collection</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={dailyChart}>
                                    <defs>
                                        <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v: number) => [`$${fmt(v)}`, 'Collected']} />
                                    <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="url(#colorFee)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Payments Table */}
                <Card>
                    <CardHeader><CardTitle>Fee Payments ({payments.total})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Admission No</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Paid</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Paid At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.data.length === 0 && (
                                    <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No payments in this period</TableCell></TableRow>
                                )}
                                {payments.data.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.student ? `${p.student.first_name} ${p.student.last_name}` : '—'}</TableCell>
                                        <TableCell>{p.student?.admission_no ?? '—'}</TableCell>
                                        <TableCell>${fmt(p.total_amount)}</TableCell>
                                        <TableCell className="text-green-600">${fmt(p.amount_paid)}</TableCell>
                                        <TableCell className="text-orange-500">${fmt(p.total_amount - p.amount_paid)}</TableCell>
                                        <TableCell><Badge variant={statusColor[p.status] ?? 'secondary'}>{p.status}</Badge></TableCell>
                                        <TableCell>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {payments.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {payments.links.map((link, i) => (
                            <Button key={i} size="sm" variant={link.active ? 'default' : 'outline'} disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
