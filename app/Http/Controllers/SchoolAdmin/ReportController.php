<?php

namespace App\Http\Controllers\SchoolAdmin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Exam;
use App\Models\FeePayment;
use App\Models\Homework;
use App\Models\Mark;
use App\Models\Payroll;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Subject;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ReportController extends Controller
{
    // ── Dashboard ─────────────────────────────────────────────────

    public function dashboard()
    {
        $sid  = $this->getSchoolId();
        $role = auth()->user()?->getRoleNames()->first() ?? 'school-admin';

        $data = match (true) {
            in_array($role, ['school-admin', 'principal']) => $this->adminDashboard($sid),
            $role === 'teacher'                             => $this->teacherDashboard($sid),
            $role === 'accountant'                          => $this->accountantDashboard($sid),
            $role === 'super-admin'                         => $this->superAdminDashboard(),
            default                                         => $this->adminDashboard($sid),
        };

        return Inertia::render('SchoolAdmin/Reports/Dashboard', array_merge($data, ['role' => $role]));
    }

    private function adminDashboard(int $sid): array
    {
        $totalStudents = Student::withoutGlobalScopes()->where('school_id', $sid)->count();
        $totalStaff    = Staff::where('school_id', $sid)->where('status', 'active')->count();

        $todayAtt = Attendance::where('school_id', $sid)->whereDate('date', today())->get();
        $attendancePct = $todayAtt->count()
            ? round($todayAtt->where('status', 'present')->count() / $todayAtt->count() * 100, 1)
            : 0;

        $monthFees = FeePayment::where('school_id', $sid)
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount_paid');

        $pendingFees = FeePayment::where('school_id', $sid)
            ->where('status', 'pending')
            ->sum(DB::raw('total_amount - amount_paid'));

        // Monthly fee collection for last 6 months
        $feeChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $feeChart[] = [
                'month'  => $month->format('M'),
                'amount' => (float) FeePayment::where('school_id', $sid)
                    ->whereMonth('paid_at', $month->month)
                    ->whereYear('paid_at', $month->year)
                    ->sum('amount_paid'),
            ];
        }

        // Attendance trend last 7 days
        $attChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $day  = now()->subDays($i);
            $recs = Attendance::where('school_id', $sid)->whereDate('date', $day)->get();
            $attChart[] = [
                'day'     => $day->format('D'),
                'present' => $recs->where('status', 'present')->count(),
                'absent'  => $recs->where('status', 'absent')->count(),
            ];
        }

        $pendingHomework = Homework::where('school_id', $sid)->where('is_active', true)->withCount([
            'submissions as pending_count' => fn ($q) => $q->where('status', 'submitted'),
        ])->get()->sum('pending_count');

        $recentActivity = Activity::with('causer')
            ->where('properties->school_id', $sid)
            ->latest()
            ->take(10)
            ->get();

        return compact('totalStudents', 'totalStaff', 'attendancePct', 'monthFees', 'pendingFees', 'feeChart', 'attChart', 'pendingHomework', 'recentActivity');
    }

    private function teacherDashboard(int $sid): array
    {
        $pending = Homework::where('school_id', $sid)->where('is_active', true)->withCount([
            'submissions as pending_count' => fn ($q) => $q->where('status', 'submitted'),
        ])->get()->sum('pending_count');

        return ['pendingHomework' => $pending, 'totalStudents' => 0, 'totalStaff' => 0, 'attendancePct' => 0, 'monthFees' => 0, 'pendingFees' => 0, 'feeChart' => [], 'attChart' => [], 'recentActivity' => collect()];
    }

    private function accountantDashboard(int $sid): array
    {
        $todayCollection = FeePayment::where('school_id', $sid)->whereDate('paid_at', today())->sum('amount_paid');
        $outstanding     = FeePayment::where('school_id', $sid)->where('status', 'pending')->sum(DB::raw('total_amount - amount_paid'));
        $monthFees       = FeePayment::where('school_id', $sid)->whereMonth('paid_at', now()->month)->whereYear('paid_at', now()->year)->sum('amount_paid');

        $feeChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $feeChart[] = [
                'month'  => $month->format('M'),
                'amount' => (float) FeePayment::where('school_id', $sid)->whereMonth('paid_at', $month->month)->whereYear('paid_at', $month->year)->sum('amount_paid'),
            ];
        }

        return ['totalStudents' => 0, 'totalStaff' => 0, 'attendancePct' => 0, 'monthFees' => $monthFees, 'pendingFees' => $outstanding, 'todayCollection' => $todayCollection, 'feeChart' => $feeChart, 'attChart' => [], 'pendingHomework' => 0, 'recentActivity' => collect()];
    }

    private function superAdminDashboard(): array
    {
        $schools  = School::count();
        $students = Student::withoutGlobalScopes()->count();
        $revenue  = FeePayment::sum('amount_paid');

        return ['schools' => $schools, 'totalStudents' => $students, 'totalStaff' => 0, 'attendancePct' => 0, 'monthFees' => $revenue, 'pendingFees' => 0, 'feeChart' => [], 'attChart' => [], 'pendingHomework' => 0, 'recentActivity' => collect()];
    }

    // ── Attendance Report ─────────────────────────────────────────

    public function attendance(Request $request)
    {
        $sid = $this->getSchoolId();

        $query = Attendance::with('student:id,first_name,last_name,admission_no', 'schoolClass:id,name')
            ->where('school_id', $sid)
            ->when($request->class_id,  fn ($q) => $q->where('class_id', $request->class_id))
            ->when($request->from_date, fn ($q) => $q->whereDate('date', '>=', $request->from_date))
            ->when($request->to_date,   fn ($q) => $q->whereDate('date', '<=', $request->to_date))
            ->when($request->status,    fn ($q) => $q->where('status', $request->status));

        $records = $query->latest('date')->paginate(50)->withQueryString();

        $summary = Attendance::where('school_id', $sid)
            ->when($request->class_id,  fn ($q) => $q->where('class_id', $request->class_id))
            ->when($request->from_date, fn ($q) => $q->whereDate('date', '>=', $request->from_date))
            ->when($request->to_date,   fn ($q) => $q->whereDate('date', '<=', $request->to_date))
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('SchoolAdmin/Reports/Attendance', [
            'records' => $records,
            'summary' => $summary,
            'classes' => SchoolClass::where('school_id', $sid)->orderBy('numeric_name')->get(['id', 'name']),
            'filters' => $request->only('class_id', 'from_date', 'to_date', 'status'),
        ]);
    }

    // ── Academic Report ───────────────────────────────────────────

    public function academic(Request $request)
    {
        $sid = $this->getSchoolId();

        $exams = Exam::where('school_id', $sid)->orderByDesc('start_date')->get(['id', 'name']);

        $classPerformance = [];
        if ($request->exam_id) {
            $classPerformance = SchoolClass::where('school_id', $sid)
                ->with(['marks' => fn ($q) => $q->where('exam_id', $request->exam_id)])
                ->get()
                ->map(function ($class) use ($request) {
                    $marks = Mark::whereHas('student', fn ($q) => $q->where('class_id', $class->id))
                        ->where('exam_id', $request->exam_id)
                        ->get();
                    $total   = $marks->count();
                    $passed  = $marks->where('is_pass', true)->count();
                    $avgPct  = $total ? round($marks->avg('percentage'), 1) : 0;
                    return [
                        'class_name'  => $class->name,
                        'total'       => $total,
                        'passed'      => $passed,
                        'failed'      => $total - $passed,
                        'pass_rate'   => $total ? round($passed / $total * 100, 1) : 0,
                        'avg_percent' => $avgPct,
                    ];
                })->values();
        }

        $subjectPerformance = [];
        if ($request->exam_id) {
            $subjectPerformance = Subject::where('school_id', $sid)
                ->get()
                ->map(function ($subject) use ($request) {
                    $marks = Mark::where('subject_id', $subject->id)->where('exam_id', $request->exam_id)->get();
                    return [
                        'subject'     => $subject->name,
                        'avg_percent' => $marks->count() ? round($marks->avg('percentage'), 1) : 0,
                        'pass_rate'   => $marks->count() ? round($marks->where('is_pass', true)->count() / $marks->count() * 100, 1) : 0,
                    ];
                })->filter(fn ($s) => $s['avg_percent'] > 0)->values();
        }

        return Inertia::render('SchoolAdmin/Reports/Academic', [
            'exams'              => $exams,
            'classPerformance'   => $classPerformance,
            'subjectPerformance' => $subjectPerformance,
            'filters'            => $request->only('exam_id', 'class_id'),
        ]);
    }

    // ── Finance Report ────────────────────────────────────────────

    public function finance(Request $request)
    {
        $sid = $this->getSchoolId();

        $from = $request->from_date ?? now()->startOfMonth()->toDateString();
        $to   = $request->to_date   ?? now()->toDateString();

        $collected = FeePayment::where('school_id', $sid)
            ->whereBetween('paid_at', [$from, $to])
            ->sum('amount_paid');

        $outstanding = FeePayment::where('school_id', $sid)
            ->where('status', 'pending')
            ->sum(DB::raw('total_amount - amount_paid'));

        $payroll = Payroll::where('school_id', $sid)
            ->whereMonth('pay_date', now()->month)
            ->sum('net_salary');

        // Daily collection chart
        $dailyChart = FeePayment::where('school_id', $sid)
            ->whereBetween('paid_at', [$from, $to])
            ->selectRaw('DATE(paid_at) as day, SUM(amount_paid) as amount')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // Recent payments
        $payments = FeePayment::with('student:id,first_name,last_name,admission_no')
            ->where('school_id', $sid)
            ->whereBetween('paid_at', [$from, $to])
            ->latest('paid_at')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('SchoolAdmin/Reports/Finance', [
            'collected'   => $collected,
            'outstanding' => $outstanding,
            'payroll'     => $payroll,
            'dailyChart'  => $dailyChart,
            'payments'    => $payments,
            'filters'     => ['from_date' => $from, 'to_date' => $to],
        ]);
    }

    // ── Custom Report Builder ─────────────────────────────────────

    public function customBuilder()
    {
        $sid = $this->getSchoolId();

        return Inertia::render('SchoolAdmin/Reports/CustomBuilder', [
            'classes'  => SchoolClass::where('school_id', $sid)->orderBy('numeric_name')->get(['id', 'name']),
            'subjects' => Subject::where('school_id', $sid)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function runCustomReport(Request $request)
    {
        $data = $request->validate([
            'entity'     => 'required|in:students,attendance,marks,fees,staff',
            'filters'    => 'nullable|array',
            'filters.class_id'  => 'nullable|exists:classes,id',
            'filters.from_date' => 'nullable|date',
            'filters.to_date'   => 'nullable|date',
            'filters.status'    => 'nullable|string',
        ]);

        $sid    = $this->getSchoolId();
        $entity = $data['entity'];
        $f      = $data['filters'] ?? [];

        $results = match ($entity) {
            'students'   => Student::withoutGlobalScopes()
                ->where('school_id', $sid)
                ->when($f['class_id'] ?? null, fn ($q) => $q->where('class_id', $f['class_id']))
                ->with('schoolClass:id,name')
                ->get(['id', 'first_name', 'last_name', 'admission_no', 'class_id', 'gender', 'status']),

            'attendance' => Attendance::where('school_id', $sid)
                ->when($f['class_id'] ?? null,  fn ($q) => $q->where('class_id', $f['class_id']))
                ->when($f['from_date'] ?? null,  fn ($q) => $q->whereDate('date', '>=', $f['from_date']))
                ->when($f['to_date'] ?? null,    fn ($q) => $q->whereDate('date', '<=', $f['to_date']))
                ->when($f['status'] ?? null,     fn ($q) => $q->where('status', $f['status']))
                ->with('student:id,first_name,last_name,admission_no')
                ->latest('date')->limit(500)->get(),

            'marks'      => Mark::whereHas('student', fn ($q) => $q->where('school_id', $sid))
                ->when($f['class_id'] ?? null,  fn ($q) => $q->whereHas('student', fn ($s) => $s->where('class_id', $f['class_id'])))
                ->with(['student:id,first_name,last_name,admission_no', 'subject:id,name', 'exam:id,name'])
                ->limit(500)->get(),

            'fees'       => FeePayment::where('school_id', $sid)
                ->when($f['from_date'] ?? null, fn ($q) => $q->whereDate('paid_at', '>=', $f['from_date']))
                ->when($f['to_date'] ?? null,   fn ($q) => $q->whereDate('paid_at', '<=', $f['to_date']))
                ->when($f['status'] ?? null,    fn ($q) => $q->where('status', $f['status']))
                ->with('student:id,first_name,last_name,admission_no')
                ->latest('paid_at')->limit(500)->get(),

            'staff'      => Staff::where('school_id', $sid)
                ->when($f['status'] ?? null, fn ($q) => $q->where('status', $f['status']))
                ->with(['department:id,name', 'designation:id,name'])
                ->get(['id', 'first_name', 'last_name', 'email', 'status', 'department_id', 'designation_id']),

            default => collect(),
        };

        return response()->json(['data' => $results, 'count' => $results->count()]);
    }

    // ── Audit Log ─────────────────────────────────────────────────

    public function auditLog(Request $request)
    {
        $logs = Activity::with('causer:id,name')
            ->when($request->causer_id, fn ($q) => $q->where('causer_id', $request->causer_id))
            ->when($request->subject_type, fn ($q) => $q->where('subject_type', 'like', '%' . $request->subject_type . '%'))
            ->when($request->from_date, fn ($q) => $q->whereDate('created_at', '>=', $request->from_date))
            ->when($request->to_date,   fn ($q) => $q->whereDate('created_at', '<=', $request->to_date))
            ->latest()
            ->paginate(50)
            ->withQueryString();

        $users = \App\Models\User::where('school_id', $this->getSchoolId())
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('SchoolAdmin/Reports/AuditLog', [
            'logs'    => $logs,
            'users'   => $users,
            'filters' => $request->only('causer_id', 'subject_type', 'from_date', 'to_date'),
        ]);
    }

    // ── PDF Exports ───────────────────────────────────────────────

    public function exportAttendancePdf(Request $request)
    {
        $sid     = $this->getSchoolId();
        $records = Attendance::with('student:id,first_name,last_name,admission_no', 'schoolClass:id,name')
            ->where('school_id', $sid)
            ->when($request->class_id,  fn ($q) => $q->where('class_id', $request->class_id))
            ->when($request->from_date, fn ($q) => $q->whereDate('date', '>=', $request->from_date))
            ->when($request->to_date,   fn ($q) => $q->whereDate('date', '<=', $request->to_date))
            ->latest('date')->get();

        $pdf = Pdf::loadView('reports.attendance', compact('records'))->setPaper('a4', 'landscape');
        return $pdf->download('attendance-report.pdf');
    }

    public function exportFinancePdf(Request $request)
    {
        $sid      = $this->getSchoolId();
        $from     = $request->from_date ?? now()->startOfMonth()->toDateString();
        $to       = $request->to_date   ?? now()->toDateString();
        $payments = FeePayment::with('student:id,first_name,last_name,admission_no')
            ->where('school_id', $sid)
            ->whereBetween('paid_at', [$from, $to])
            ->latest('paid_at')->get();

        $pdf = Pdf::loadView('reports.finance', compact('payments', 'from', 'to'))->setPaper('a4', 'landscape');
        return $pdf->download('finance-report.pdf');
    }

    public function exportCsv(Request $request)
    {
        $data = $request->validate(['entity' => 'required|in:students,attendance,marks,fees,staff']);
        $response = $this->runCustomReport($request);
        $items    = json_decode($response->getContent(), true)['data'] ?? [];

        if (empty($items)) {
            return back()->with('error', 'No data to export.');
        }

        $headers  = array_keys($items[0] ?? []);
        $csv      = implode(',', $headers) . "\n";
        foreach ($items as $row) {
            $csv .= implode(',', array_map(fn ($v) => '"' . str_replace('"', '""', (string) ($v ?? '')) . '"', array_values($row))) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $data['entity'] . '-report.csv"',
        ]);
    }
}
