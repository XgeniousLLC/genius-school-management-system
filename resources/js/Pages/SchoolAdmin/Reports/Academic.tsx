import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Filter } from 'lucide-react';

interface Exam { id: number; name: string; }
interface ClassPerf { class_name: string; total: number; passed: number; failed: number; pass_rate: number; avg_percent: number; }
interface SubjectPerf { subject: string; avg_percent: number; pass_rate: number; }
interface Props {
    exams:              Exam[];
    classPerformance:   ClassPerf[];
    subjectPerformance: SubjectPerf[];
    filters:            { exam_id?: string };
}

export default function AcademicReport({ exams, classPerformance, subjectPerformance, filters }: Props) {
    const [examId, setExamId] = useState(filters.exam_id ?? '');

    function applyFilter() {
        router.get('/school/reports/academic', { exam_id: examId || undefined }, { preserveState: true });
    }

    return (
        <AppLayout title="Academic Report">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Report</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Class performance and subject-wise analysis</p>
                </div>

                {/* Filter */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex gap-3 items-end">
                            <div className="w-64">
                                <Label className="text-xs mb-1 block">Exam</Label>
                                <Select value={examId} onValueChange={setExamId}>
                                    <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                                    <SelectContent>
                                        {exams.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={applyFilter} className="gap-2"><Filter className="w-4 h-4" /> Apply</Button>
                        </div>
                    </CardContent>
                </Card>

                {classPerformance.length === 0 && (
                    <Card><CardContent className="py-12 text-center text-slate-400">Select an exam to view performance data</CardContent></Card>
                )}

                {classPerformance.length > 0 && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Class Performance Chart */}
                        <Card>
                            <CardHeader><CardTitle>Pass Rate by Class</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={classPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="class_name" tick={{ fontSize: 11 }} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                                        <Tooltip formatter={(v: number) => [`${v}%`, 'Pass Rate']} />
                                        <Bar dataKey="pass_rate" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Subject Performance Chart */}
                        <Card>
                            <CardHeader><CardTitle>Average % by Subject</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={subjectPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                                        <Tooltip formatter={(v: number) => [`${v}%`, 'Avg %']} />
                                        <Bar dataKey="avg_percent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Class Table */}
                {classPerformance.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Class-wise Performance</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Total Students</TableHead>
                                        <TableHead>Passed</TableHead>
                                        <TableHead>Failed</TableHead>
                                        <TableHead>Pass Rate</TableHead>
                                        <TableHead>Avg %</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classPerformance.map((c, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{c.class_name}</TableCell>
                                            <TableCell>{c.total}</TableCell>
                                            <TableCell className="text-green-600">{c.passed}</TableCell>
                                            <TableCell className="text-red-500">{c.failed}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${c.pass_rate}%` }} />
                                                    </div>
                                                    <span className="text-sm">{c.pass_rate}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{c.avg_percent}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
