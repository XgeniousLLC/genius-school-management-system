import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, Download, Info } from 'lucide-react';
import axios from 'axios';

interface SchoolClass { id: number; name: string; }
interface Props { classes: SchoolClass[]; subjects: { id: number; name: string }[]; }

type Entity = 'students' | 'attendance' | 'marks' | 'fees' | 'staff';

const entityLabels: Record<Entity, string> = {
    students: 'Students', attendance: 'Attendance', marks: 'Exam Marks', fees: 'Fee Payments', staff: 'Staff',
};

export default function CustomBuilder({ classes, subjects }: Props) {
    const [entity, setEntity]     = useState<Entity>('students');
    const [classId, setClassId]   = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate]     = useState('');
    const [status, setStatus]     = useState('');
    const [loading, setLoading]   = useState(false);
    const [results, setResults]   = useState<Record<string, unknown>[]>([]);
    const [count, setCount]       = useState(0);

    async function run() {
        setLoading(true);
        try {
            const res = await axios.post('/school/reports/custom/run', {
                entity,
                filters: {
                    class_id:  classId  || undefined,
                    from_date: fromDate || undefined,
                    to_date:   toDate   || undefined,
                    status:    status   || undefined,
                },
            });
            setResults(res.data.data ?? []);
            setCount(res.data.count ?? 0);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    function exportCsv() {
        const q = new URLSearchParams({ entity, class_id: classId, from_date: fromDate, to_date: toDate, status }).toString();
        window.open('/school/reports/custom/export-csv?' + q);
    }

    const headers = results.length > 0 ? Object.keys(results[0]).filter(k => !['school_class', 'subject', 'student', 'exam', 'department', 'designation'].includes(k)) : [];

    function flatVal(row: Record<string, unknown>, key: string): string {
        const v = row[key];
        if (v === null || v === undefined) return '—';
        if (typeof v === 'object') return JSON.stringify(v);
        return String(v);
    }

    return (
        <AppLayout title="Custom Report Builder">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Custom Report Builder</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Choose an entity, apply filters, and export</p>
                </div>

                <Card>
                    <CardHeader><CardTitle>Report Configuration</CardTitle></CardHeader>
                    <CardContent className="space-y-5">
                        {/* Entity */}
                        <div>
                            <Label>Entity *</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {(Object.keys(entityLabels) as Entity[]).map(e => (
                                    <button key={e} type="button" onClick={() => { setEntity(e); setResults([]); }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${entity === e ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700'}`}>
                                        {entityLabels[e]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {(entity === 'students' || entity === 'attendance' || entity === 'marks') && (
                                <div>
                                    <Label className="text-xs mb-1 block">Class</Label>
                                    <Select value={classId} onValueChange={setClassId}>
                                        <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {(entity === 'attendance' || entity === 'fees') && (
                                <>
                                    <div>
                                        <Label className="text-xs mb-1 block">From Date</Label>
                                        <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1 block">To Date</Label>
                                        <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                                    </div>
                                </>
                            )}
                            {(entity === 'attendance' || entity === 'fees' || entity === 'staff') && (
                                <div>
                                    <Label className="text-xs mb-1 block">Status</Label>
                                    <Input value={status} onChange={e => setStatus(e.target.value)} placeholder="e.g. present, paid" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={run} disabled={loading} className="gap-2">
                                <Play className="w-4 h-4" /> {loading ? 'Running...' : 'Run Report'}
                            </Button>
                            {results.length > 0 && (
                                <Button variant="outline" onClick={exportCsv} className="gap-2">
                                    <Download className="w-4 h-4" /> Export CSV
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                {results.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{entityLabels[entity]} — {count} records</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {headers.map(h => <TableHead key={h}>{h.replace(/_/g, ' ')}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.slice(0, 100).map((row, i) => (
                                        <TableRow key={i}>
                                            {headers.map(h => (
                                                <TableCell key={h} className="text-sm">{flatVal(row, h)}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {count > 100 && (
                                <p className="text-xs text-slate-400 px-4 py-2 flex items-center gap-1">
                                    <Info className="w-3 h-3" /> Showing first 100 rows. Export CSV for full data.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {!loading && results.length === 0 && count === 0 && (
                    <Card><CardContent className="py-12 text-center text-slate-400">Configure your report and click Run Report</CardContent></Card>
                )}
            </div>
        </AppLayout>
    );
}
