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
import { Filter, ShieldCheck } from 'lucide-react';

interface User { id: number; name: string; }
interface Log {
    id: number;
    description: string;
    subject_type?: string;
    event?: string;
    created_at: string;
    causer?: User;
    properties?: { attributes?: Record<string, unknown>; old?: Record<string, unknown> };
}
interface Paginated { data: Log[]; total: number; last_page: number; links: { url: string | null; label: string; active: boolean }[]; }
interface Props { logs: Paginated; users: User[]; filters: { causer_id?: string; subject_type?: string; from_date?: string; to_date?: string }; }

const eventColor: Record<string, 'default' | 'secondary' | 'destructive'> = {
    created: 'default', updated: 'secondary', deleted: 'destructive',
};

export default function AuditLog({ logs, users, filters }: Props) {
    const [causerId, setCauserId]         = useState(filters.causer_id ?? '');
    const [subjectType, setSubjectType]   = useState(filters.subject_type ?? '');
    const [fromDate, setFromDate]         = useState(filters.from_date ?? '');
    const [toDate, setToDate]             = useState(filters.to_date ?? '');

    function applyFilter() {
        router.get('/school/reports/audit-log', {
            causer_id:    causerId    || undefined,
            subject_type: subjectType || undefined,
            from_date:    fromDate    || undefined,
            to_date:      toDate      || undefined,
        }, { preserveState: true });
    }

    function modelLabel(type?: string) {
        if (!type) return '—';
        return type.split('\\').pop() ?? type;
    }

    return (
        <AppLayout title="Audit Log">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-indigo-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Full activity trail — who did what and when</p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="w-48">
                                <Label className="text-xs mb-1 block">User</Label>
                                <Select value={causerId} onValueChange={setCauserId}>
                                    <SelectTrigger><SelectValue placeholder="All users" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {users.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-40">
                                <Label className="text-xs mb-1 block">Model Type</Label>
                                <Input value={subjectType} onChange={e => setSubjectType(e.target.value)} placeholder="e.g. Student" />
                            </div>
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

                <Card>
                    <CardHeader><CardTitle>Activity Log ({logs.total})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">No activity records found</TableCell></TableRow>
                                )}
                                {logs.data.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">{log.causer?.name ?? 'System'}</TableCell>
                                        <TableCell>
                                            {log.event && (
                                                <Badge variant={eventColor[log.event] ?? 'secondary'} className="text-xs capitalize">
                                                    {log.event}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">{modelLabel(log.subject_type)}</TableCell>
                                        <TableCell className="text-sm max-w-xs truncate">{log.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {logs.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {logs.links.map((link, i) => (
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
