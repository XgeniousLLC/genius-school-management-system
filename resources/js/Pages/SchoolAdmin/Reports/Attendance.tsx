import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter } from 'lucide-react';

interface SchoolClass { id: number; name: string; }
interface Record {
    id: number; date: string; status: string;
    student?: { first_name: string; last_name: string; admission_no: string };
    school_class?: SchoolClass;
}
interface Paginated { data: Record[]; total: number; last_page: number; links: { url: string | null; label: string; active: boolean }[]; }
interface Props {
    records: Paginated;
    summary: Record<string, number>;
    classes: SchoolClass[];
    filters: { class_id?: string; from_date?: string; to_date?: string; status?: string };
}

const statusColor: Record<string, 'default' | 'secondary' | 'destructive'> = {
    present: 'default', absent: 'destructive', late: 'secondary', excused: 'secondary',
};

export default function AttendanceReport({ records, summary, classes, filters }: Props) {
    const [classId, setClassId]   = useState(filters.class_id ?? '');
    const [fromDate, setFromDate] = useState(filters.from_date ?? '');
    const [toDate, setToDate]     = useState(filters.to_date ?? '');
    const [status, setStatus]     = useState(filters.status ?? '');

    function applyFilter() {
        router.get('/school/reports/attendance', {
            class_id: classId || undefined, from_date: fromDate || undefined,
            to_date: toDate || undefined, status: status || undefined,
        }, { preserveState: true });
    }
    function exportPdf() {
        const q = new URLSearchParams({ class_id: classId, from_date: fromDate, to_date: toDate }).toString();
        window.open('/school/reports/attendance/export-pdf?' + q);
    }

    const total = Object.values(summary).reduce((a, b) => a + b, 0);

    return (
        <AppLayout title="Attendance Report">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Report</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Daily and period-wise attendance records</p>
                    </div>
                    <Button variant="outline" onClick={exportPdf} className="gap-2">
                        <Download className="w-4 h-4" /> Export PDF
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="w-44">
                                <Label className="text-xs mb-1 block">Class</Label>
                                <Select value={classId} onValueChange={setClassId}>
                                    <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-36">
                                <Label className="text-xs mb-1 block">From</Label>
                                <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                            </div>
                            <div className="w-36">
                                <Label className="text-xs mb-1 block">To</Label>
                                <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                            </div>
                            <div className="w-36">
                                <Label className="text-xs mb-1 block">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="present">Present</SelectItem>
                                        <SelectItem value="absent">Absent</SelectItem>
                                        <SelectItem value="late">Late</SelectItem>
                                        <SelectItem value="excused">Excused</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={applyFilter} className="gap-2"><Filter className="w-4 h-4" /> Filter</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                {total > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(['present', 'absent', 'late', 'excused'] as const).map(s => (
                            <Card key={s}>
                                <CardContent className="pt-4 pb-4 text-center">
                                    <p className="text-xs text-slate-500 capitalize">{s}</p>
                                    <p className="text-2xl font-bold mt-1">{summary[s] ?? 0}</p>
                                    <p className="text-xs text-slate-400">{total ? ((summary[s] ?? 0) / total * 100).toFixed(1) : 0}%</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Table */}
                <Card>
                    <CardHeader><CardTitle>Records ({records.total})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Admission No</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.data.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">No records found</TableCell></TableRow>
                                )}
                                {records.data.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell>{r.student ? `${r.student.first_name} ${r.student.last_name}` : '—'}</TableCell>
                                        <TableCell>{r.student?.admission_no ?? '—'}</TableCell>
                                        <TableCell>{r.school_class?.name ?? '—'}</TableCell>
                                        <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                                        <TableCell><Badge variant={statusColor[r.status] ?? 'secondary'}>{r.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {records.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {records.links.map((link, i) => (
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
