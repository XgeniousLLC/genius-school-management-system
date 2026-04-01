import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCog, CalendarCheck, DollarSign, Clock, AlertCircle } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend,
} from 'recharts';

interface Activity { id: number; description: string; causer?: { name: string }; created_at: string; }
interface Props {
    role:             string;
    totalStudents:    number;
    totalStaff:       number;
    attendancePct:    number;
    monthFees:        number;
    pendingFees:      number;
    pendingHomework:  number;
    todayCollection?: number;
    feeChart:         { month: string; amount: number }[];
    attChart:         { day: string; present: number; absent: number }[];
    recentActivity:   Activity[];
    schools?:         number;
}

function KpiCard({ title, value, sub, icon: Icon, color }: { title: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
    return (
        <Card>
            <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">{title}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
                    </div>
                    <div className={`p-3 rounded-xl ${color}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ role, totalStudents, totalStaff, attendancePct, monthFees, pendingFees, pendingHomework, todayCollection, feeChart, attChart, recentActivity, schools }: Props) {
    const fmt = (n: number) => new Intl.NumberFormat().format(n);

    return (
        <AppLayout title="Reports Dashboard">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">School performance overview</p>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {role === 'super-admin' ? (
                        <>
                            <KpiCard title="Total Schools"   value={schools ?? 0}          icon={Users}        color="bg-indigo-500" />
                            <KpiCard title="Total Students"  value={fmt(totalStudents)}     icon={Users}        color="bg-green-500" />
                            <KpiCard title="Total Revenue"   value={`$${fmt(monthFees)}`}   icon={DollarSign}   color="bg-blue-500" />
                        </>
                    ) : (
                        <>
                            <KpiCard title="Total Students"  value={fmt(totalStudents)}     icon={Users}        color="bg-indigo-500" />
                            <KpiCard title="Active Staff"    value={fmt(totalStaff)}        icon={UserCog}      color="bg-violet-500" />
                            <KpiCard title="Today Attendance" value={`${attendancePct}%`}   icon={CalendarCheck} color="bg-green-500" />
                            <KpiCard title="This Month Fees" value={`$${fmt(monthFees)}`}   icon={DollarSign}   color="bg-blue-500" />
                        </>
                    )}
                    <KpiCard title="Outstanding Fees"  value={`$${fmt(pendingFees)}`}      icon={AlertCircle}  color="bg-orange-500" />
                    {role === 'accountant' && todayCollection !== undefined && (
                        <KpiCard title="Today Collection" value={`$${fmt(todayCollection)}`} icon={DollarSign} color="bg-teal-500" />
                    )}
                    {(role === 'school-admin' || role === 'principal' || role === 'teacher') && (
                        <KpiCard title="Homework Pending" value={pendingHomework}           icon={Clock}        color="bg-yellow-500" />
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Fee Collection Chart */}
                    {feeChart.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Fee Collection (Last 6 Months)</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={feeChart}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip formatter={(v: number) => [`$${fmt(v)}`, 'Collected']} />
                                        <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Attendance Chart */}
                    {attChart.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Attendance — Last 7 Days</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={attChart}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="absent"  stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Recent Activity */}
                {recentActivity && recentActivity.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                        <CardContent className="divide-y divide-slate-100 dark:divide-slate-800 p-0">
                            {recentActivity.map((a) => (
                                <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs font-semibold text-indigo-600">
                                        {(a.causer?.name ?? '?')[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{a.description}</p>
                                        <p className="text-xs text-slate-400">{a.causer?.name} · {new Date(a.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
