<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\SchoolAdmin\AttendanceController;
use App\Http\Controllers\SchoolAdmin\ExamController;
use App\Http\Controllers\SchoolAdmin\FeeCategoryController;
use App\Http\Controllers\SchoolAdmin\FeePaymentController;
use App\Http\Controllers\SchoolAdmin\FeeStructureController;
use App\Http\Controllers\SchoolAdmin\CommunicationController;
use App\Http\Controllers\SchoolAdmin\IntegrationController;
use App\Http\Controllers\SchoolAdmin\ReportController;
use App\Http\Controllers\SchoolAdmin\HomeworkController;
use App\Http\Controllers\SchoolAdmin\LeaveController;
use App\Http\Controllers\SchoolAdmin\AssetController;
use App\Http\Controllers\SchoolAdmin\HostelController;
use App\Http\Controllers\SchoolAdmin\TransportController;
use App\Http\Controllers\SchoolAdmin\InventoryController;
use App\Http\Controllers\SchoolAdmin\LibraryController;
use App\Http\Controllers\SchoolAdmin\PayrollController;
use App\Http\Controllers\SchoolAdmin\TimetableController;
use App\Http\Controllers\SchoolAdmin\ClassController;
use App\Http\Controllers\SchoolAdmin\DepartmentController;
use App\Http\Controllers\SchoolAdmin\DesignationController;
use App\Http\Controllers\SchoolAdmin\HolidayController;
use App\Http\Controllers\SchoolAdmin\SectionController;
use App\Http\Controllers\SchoolAdmin\ShiftController;
use App\Http\Controllers\SchoolAdmin\StaffController;
use App\Http\Controllers\SchoolAdmin\StudentController;
use App\Http\Controllers\SchoolAdmin\SubjectController;
use App\Http\Controllers\SuperAdmin\SchoolController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Guest routes
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/', fn () => redirect()->route('login'));
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Authenticated routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', function () {
        $user = auth()->user();

        // Redirect to role-specific dashboard
        return match (true) {
            $user->hasRole('super-admin')                         => redirect()->route('super-admin.schools.index'),
            $user->hasRole('school-admin') || $user->hasRole('principal') => redirect()->route('school.students.index'),
            $user->hasRole('teacher')                             => redirect()->route('school.students.index'),
            default                                               => Inertia::render('Dashboard'),
        };
    })->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | School Admin routes (school-admin, principal)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super-admin|school-admin|principal|teacher|accountant|librarian')
        ->prefix('school')
        ->name('school.')
        ->group(function () {
            Route::resource('classes',  ClassController::class)->except(['create', 'edit', 'show']);
            Route::resource('sections', SectionController::class)->except(['create', 'edit', 'show']);
            Route::resource('subjects', SubjectController::class)->except(['create', 'edit', 'show']);
            Route::resource('shifts',   ShiftController::class)->except(['create', 'edit', 'show']);
            Route::resource('holidays', HolidayController::class)->except(['create', 'edit', 'show']);
            Route::resource('students', StudentController::class);
            Route::post('students/{student}/documents',        [StudentController::class, 'uploadDocument'])->name('students.documents.upload');
            Route::delete('students/documents/{document}',     [StudentController::class, 'deleteDocument'])->name('students.documents.delete');

            // Exams
            Route::get('exams',                              [ExamController::class, 'index'])->name('exams.index');
            Route::post('exams',                             [ExamController::class, 'store'])->name('exams.store');
            Route::put('exams/{exam}',                       [ExamController::class, 'update'])->name('exams.update');
            Route::delete('exams/{exam}',                    [ExamController::class, 'destroy'])->name('exams.destroy');
            Route::get('exams/{exam}/marks',                 [ExamController::class, 'marks'])->name('exams.marks');
            Route::post('exams/{exam}/marks',                [ExamController::class, 'saveMarks'])->name('exams.marks.save');
            Route::get('exams/{exam}/results',               [ExamController::class, 'results'])->name('exams.results');
            Route::get('grade-scales',                       [ExamController::class, 'gradeScales'])->name('grade-scales.index');
            Route::post('grade-scales',                      [ExamController::class, 'saveGradeScale'])->name('grade-scales.store');
            Route::put('grade-scales/{gradeScale}',          [ExamController::class, 'updateGradeScale'])->name('grade-scales.update');
            Route::delete('grade-scales/{gradeScale}',       [ExamController::class, 'deleteGradeScale'])->name('grade-scales.destroy');

            // Timetable
            Route::get('timetable',                      [TimetableController::class, 'index'])->name('timetable.index');
            Route::post('timetable',                     [TimetableController::class, 'store'])->name('timetable.store');
            Route::delete('timetable/{timetable}',       [TimetableController::class, 'destroy'])->name('timetable.destroy');
            Route::get('timetable/teacher',              [TimetableController::class, 'teacherSchedule'])->name('timetable.teacher');

            // Attendance — student
            Route::get('attendance',                          [AttendanceController::class, 'index'])->name('attendance.index');
            Route::post('attendance',                         [AttendanceController::class, 'store'])->name('attendance.store');
            Route::get('attendance/students/{student}/calendar', [AttendanceController::class, 'studentCalendar'])->name('attendance.student.calendar');
            // Attendance — staff
            Route::get('attendance/staff',                    [AttendanceController::class, 'staffIndex'])->name('attendance.staff.index');
            Route::post('attendance/staff',                   [AttendanceController::class, 'staffStore'])->name('attendance.staff.store');

            // HR — Leave Management
            Route::get('hr/leave-types',                       [LeaveController::class, 'types'])->name('hr.leave-types.index');
            Route::post('hr/leave-types',                      [LeaveController::class, 'storeType'])->name('hr.leave-types.store');
            Route::put('hr/leave-types/{leaveType}',           [LeaveController::class, 'updateType'])->name('hr.leave-types.update');
            Route::delete('hr/leave-types/{leaveType}',        [LeaveController::class, 'destroyType'])->name('hr.leave-types.destroy');
            Route::get('hr/leaves',                            [LeaveController::class, 'index'])->name('hr.leaves.index');
            Route::post('hr/leaves',                           [LeaveController::class, 'store'])->name('hr.leaves.store');
            Route::put('hr/leaves/{leaveRequest}/approve',     [LeaveController::class, 'approve'])->name('hr.leaves.approve');

            // HR — Payroll
            Route::get('hr/salary-structure',                  [PayrollController::class, 'structure'])->name('hr.salary-structure.index');
            Route::put('hr/salary-structure/{staff}',          [PayrollController::class, 'saveStructure'])->name('hr.salary-structure.save');
            Route::get('hr/payroll',                           [PayrollController::class, 'index'])->name('hr.payroll.index');
            Route::post('hr/payroll/generate',                 [PayrollController::class, 'generate'])->name('hr.payroll.generate');
            Route::put('hr/payroll/{payroll}/paid',            [PayrollController::class, 'markPaid'])->name('hr.payroll.paid');
            Route::get('hr/payroll/{payroll}/slip',            [PayrollController::class, 'slip'])->name('hr.payroll.slip');

            // Library Management
            Route::get('library/books',                        [LibraryController::class, 'index'])->name('library.books.index');
            Route::post('library/books',                       [LibraryController::class, 'store'])->name('library.books.store');
            Route::put('library/books/{book}',                 [LibraryController::class, 'update'])->name('library.books.update');
            Route::delete('library/books/{book}',              [LibraryController::class, 'destroy'])->name('library.books.destroy');
            Route::get('library/issues',                       [LibraryController::class, 'issues'])->name('library.issues.index');
            Route::post('library/issues',                      [LibraryController::class, 'issueBook'])->name('library.issues.store');
            Route::put('library/issues/{bookIssue}/return',    [LibraryController::class, 'returnBook'])->name('library.issues.return');
            Route::get('library/overdue',                      [LibraryController::class, 'overdue'])->name('library.overdue');

            // Inventory Management
            Route::get('inventory/categories',                         [InventoryController::class, 'categories'])->name('inventory.categories');
            Route::post('inventory/categories',                        [InventoryController::class, 'storeCategory'])->name('inventory.categories.store');
            Route::put('inventory/categories/{inventoryCategory}',     [InventoryController::class, 'updateCategory'])->name('inventory.categories.update');
            Route::delete('inventory/categories/{inventoryCategory}',  [InventoryController::class, 'destroyCategory'])->name('inventory.categories.destroy');

            Route::get('inventory/items',                              [InventoryController::class, 'items'])->name('inventory.items');
            Route::post('inventory/items',                             [InventoryController::class, 'storeItem'])->name('inventory.items.store');
            Route::put('inventory/items/{inventoryItem}',              [InventoryController::class, 'updateItem'])->name('inventory.items.update');
            Route::delete('inventory/items/{inventoryItem}',           [InventoryController::class, 'destroyItem'])->name('inventory.items.destroy');

            Route::get('inventory/purchases',                          [InventoryController::class, 'purchases'])->name('inventory.purchases');
            Route::post('inventory/purchases',                         [InventoryController::class, 'storePurchase'])->name('inventory.purchases.store');

            Route::get('inventory/issues',                             [InventoryController::class, 'issues'])->name('inventory.issues');
            Route::post('inventory/issues',                            [InventoryController::class, 'storeIssue'])->name('inventory.issues.store');
            Route::put('inventory/issues/{inventoryIssue}/return',     [InventoryController::class, 'returnIssue'])->name('inventory.issues.return');

            // Asset Management
            Route::get('inventory/assets',                             [AssetController::class, 'index'])->name('inventory.assets');
            Route::post('inventory/assets',                            [AssetController::class, 'store'])->name('inventory.assets.store');
            Route::get('inventory/assets/{asset}',                     [AssetController::class, 'show'])->name('inventory.assets.show');
            Route::put('inventory/assets/{asset}',                     [AssetController::class, 'update'])->name('inventory.assets.update');
            Route::delete('inventory/assets/{asset}',                  [AssetController::class, 'destroy'])->name('inventory.assets.destroy');
            Route::post('inventory/assets/{asset}/maintenance',        [AssetController::class, 'storeMaintenance'])->name('inventory.assets.maintenance');

            // Hostel Management
            Route::get('hostel',                                          [HostelController::class, 'index'])->name('hostel.index');
            Route::post('hostel',                                         [HostelController::class, 'store'])->name('hostel.store');
            Route::put('hostel/{hostel}',                                 [HostelController::class, 'update'])->name('hostel.update');
            Route::delete('hostel/{hostel}',                              [HostelController::class, 'destroy'])->name('hostel.destroy');

            Route::get('hostel/{hostel}/rooms',                           [HostelController::class, 'rooms'])->name('hostel.rooms');
            Route::post('hostel/{hostel}/rooms',                          [HostelController::class, 'storeRoom'])->name('hostel.rooms.store');
            Route::put('hostel/{hostel}/rooms/{room}',                    [HostelController::class, 'updateRoom'])->name('hostel.rooms.update');
            Route::delete('hostel/{hostel}/rooms/{room}',                 [HostelController::class, 'destroyRoom'])->name('hostel.rooms.destroy');
            Route::get('hostel/{hostel}/available-rooms',                 [HostelController::class, 'hostelRooms'])->name('hostel.available-rooms');

            Route::get('hostel/allocations',                              [HostelController::class, 'allocations'])->name('hostel.allocations');
            Route::post('hostel/allocations',                             [HostelController::class, 'storeAllocation'])->name('hostel.allocations.store');
            Route::put('hostel/allocations/{allocation}/vacate',          [HostelController::class, 'vacate'])->name('hostel.vacate');

            // Transport Management
            Route::get('transport/vehicles',                          [TransportController::class, 'vehicles'])->name('transport.vehicles');
            Route::post('transport/vehicles',                         [TransportController::class, 'storeVehicle'])->name('transport.vehicles.store');
            Route::put('transport/vehicles/{vehicle}',                [TransportController::class, 'updateVehicle'])->name('transport.vehicles.update');
            Route::delete('transport/vehicles/{vehicle}',             [TransportController::class, 'destroyVehicle'])->name('transport.vehicles.destroy');

            Route::get('transport/routes',                            [TransportController::class, 'routes'])->name('transport.routes');
            Route::post('transport/routes',                           [TransportController::class, 'storeRoute'])->name('transport.routes.store');
            Route::put('transport/routes/{route}',                    [TransportController::class, 'updateRoute'])->name('transport.routes.update');
            Route::delete('transport/routes/{route}',                 [TransportController::class, 'destroyRoute'])->name('transport.routes.destroy');

            Route::get('transport/routes/{route}/assignments',        [TransportController::class, 'assignments'])->name('transport.assignments');
            Route::post('transport/routes/{route}/assign',            [TransportController::class, 'assignStudent'])->name('transport.assign');
            Route::delete('transport/routes/{route}/students/{student}', [TransportController::class, 'removeStudent'])->name('transport.unassign');

            // Homework & Lesson Planning
            Route::get('homework',                                    [HomeworkController::class, 'index'])->name('homework.index');
            Route::post('homework',                                   [HomeworkController::class, 'store'])->name('homework.store');
            Route::put('homework/{homework}',                         [HomeworkController::class, 'update'])->name('homework.update');
            Route::delete('homework/{homework}',                      [HomeworkController::class, 'destroy'])->name('homework.destroy');
            Route::get('homework/{homework}/submissions',             [HomeworkController::class, 'submissions'])->name('homework.submissions');
            Route::put('homework/submissions/{submission}/review',    [HomeworkController::class, 'reviewSubmission'])->name('homework.submissions.review');

            Route::get('homework/lesson-plans',                       [HomeworkController::class, 'lessonPlans'])->name('homework.lesson-plans.index');
            Route::post('homework/lesson-plans',                      [HomeworkController::class, 'storeLessonPlan'])->name('homework.lesson-plans.store');
            Route::put('homework/lesson-plans/{lessonPlan}/review',   [HomeworkController::class, 'reviewLessonPlan'])->name('homework.lesson-plans.review');
            Route::delete('homework/lesson-plans/{lessonPlan}',       [HomeworkController::class, 'destroyLessonPlan'])->name('homework.lesson-plans.destroy');

            Route::get('homework/syllabi',                            [HomeworkController::class, 'syllabi'])->name('homework.syllabi.index');
            Route::post('homework/syllabi',                           [HomeworkController::class, 'storeSyllabus'])->name('homework.syllabi.store');
            Route::put('homework/syllabi/{syllabus}',                 [HomeworkController::class, 'updateSyllabus'])->name('homework.syllabi.update');

            Route::get('homework/online-classes',                     [HomeworkController::class, 'onlineClasses'])->name('homework.online-classes.index');
            Route::post('homework/online-classes',                    [HomeworkController::class, 'storeOnlineClass'])->name('homework.online-classes.store');
            Route::put('homework/online-classes/{onlineClass}/status',[HomeworkController::class, 'updateOnlineClassStatus'])->name('homework.online-classes.status');
            Route::delete('homework/online-classes/{onlineClass}',    [HomeworkController::class, 'destroyOnlineClass'])->name('homework.online-classes.destroy');

            // Fee Management
            Route::get('fees/categories',                    [FeeCategoryController::class, 'index'])->name('fees.categories.index');
            Route::post('fees/categories',                   [FeeCategoryController::class, 'store'])->name('fees.categories.store');
            Route::put('fees/categories/{feeCategory}',      [FeeCategoryController::class, 'update'])->name('fees.categories.update');
            Route::delete('fees/categories/{feeCategory}',   [FeeCategoryController::class, 'destroy'])->name('fees.categories.destroy');

            Route::get('fees/structures',                    [FeeStructureController::class, 'index'])->name('fees.structures.index');
            Route::post('fees/structures',                   [FeeStructureController::class, 'store'])->name('fees.structures.store');
            Route::put('fees/structures/{feeStructure}',     [FeeStructureController::class, 'update'])->name('fees.structures.update');
            Route::delete('fees/structures/{feeStructure}',  [FeeStructureController::class, 'destroy'])->name('fees.structures.destroy');

            Route::get('fees/payments',                      [FeePaymentController::class, 'index'])->name('fees.payments.index');
            Route::get('fees/payments/collect',              [FeePaymentController::class, 'create'])->name('fees.payments.create');
            Route::post('fees/payments',                     [FeePaymentController::class, 'store'])->name('fees.payments.store');
            Route::get('fees/payments/{feePayment}',         [FeePaymentController::class, 'show'])->name('fees.payments.show');
            Route::get('fees/outstanding',                   [FeePaymentController::class, 'outstanding'])->name('fees.outstanding');

            // Communication
            Route::get('communication/announcements',                              [CommunicationController::class, 'announcements'])->name('communication.announcements');
            Route::post('communication/announcements',                             [CommunicationController::class, 'storeAnnouncement'])->name('communication.announcements.store');
            Route::put('communication/announcements/{announcement}',               [CommunicationController::class, 'updateAnnouncement'])->name('communication.announcements.update');
            Route::delete('communication/announcements/{announcement}',            [CommunicationController::class, 'destroyAnnouncement'])->name('communication.announcements.destroy');

            Route::get('communication/messages',                                   [CommunicationController::class, 'messages'])->name('communication.messages');
            Route::post('communication/messages',                                  [CommunicationController::class, 'sendMessage'])->name('communication.messages.send');
            Route::put('communication/messages/{message}/read',                    [CommunicationController::class, 'readMessage'])->name('communication.messages.read');

            Route::get('communication/blast',                                      [CommunicationController::class, 'blast'])->name('communication.blast');
            Route::post('communication/blast',                                     [CommunicationController::class, 'sendBlast'])->name('communication.blast.send');

            Route::get('communication/email-templates',                            [CommunicationController::class, 'emailTemplates'])->name('communication.email-templates');
            Route::post('communication/email-templates',                           [CommunicationController::class, 'storeEmailTemplate'])->name('communication.email-templates.store');
            Route::put('communication/email-templates/{emailTemplate}',            [CommunicationController::class, 'updateEmailTemplate'])->name('communication.email-templates.update');

            Route::get('communication/notifications',                              [CommunicationController::class, 'notifications'])->name('communication.notifications');
            Route::put('communication/notifications/{notification}/read',          [CommunicationController::class, 'markNotificationRead'])->name('communication.notifications.read');
            Route::put('communication/notifications/read-all',                     [CommunicationController::class, 'markAllNotificationsRead'])->name('communication.notifications.read-all');

            // Reports & Analytics
            Route::get('reports/dashboard',                     [ReportController::class, 'dashboard'])->name('reports.dashboard');
            Route::get('reports/attendance',                    [ReportController::class, 'attendance'])->name('reports.attendance');
            Route::get('reports/academic',                      [ReportController::class, 'academic'])->name('reports.academic');
            Route::get('reports/finance',                       [ReportController::class, 'finance'])->name('reports.finance');
            Route::get('reports/custom',                        [ReportController::class, 'customBuilder'])->name('reports.custom');
            Route::post('reports/custom/run',                   [ReportController::class, 'runCustomReport'])->name('reports.custom.run');
            Route::get('reports/custom/export-csv',             [ReportController::class, 'exportCsv'])->name('reports.custom.csv');
            Route::get('reports/attendance/export-pdf',         [ReportController::class, 'exportAttendancePdf'])->name('reports.attendance.pdf');
            Route::get('reports/finance/export-pdf',            [ReportController::class, 'exportFinancePdf'])->name('reports.finance.pdf');
            Route::get('reports/audit-log',                     [ReportController::class, 'auditLog'])->name('reports.audit-log');

            // Integrations / Gateway Settings
            Route::get('settings/integrations',                 [IntegrationController::class, 'index'])->name('settings.integrations');
            Route::post('settings/integrations/smtp',           [IntegrationController::class, 'saveSmtp'])->name('settings.integrations.smtp');
            Route::post('settings/integrations/smtp/test',      [IntegrationController::class, 'testSmtp'])->name('settings.integrations.smtp.test');
            Route::post('settings/integrations/sms',            [IntegrationController::class, 'saveSms'])->name('settings.integrations.sms');
            Route::post('settings/integrations/sms/test',       [IntegrationController::class, 'testSms'])->name('settings.integrations.sms.test');

            Route::resource('departments',  DepartmentController::class)->except(['create', 'edit', 'show']);
            Route::resource('designations', DesignationController::class)->except(['create', 'edit', 'show']);
            Route::resource('staff',        StaffController::class);
            Route::post('staff/{staff}/documents',         [StaffController::class, 'uploadDocument'])->name('staff.documents.upload');
            Route::delete('staff/documents/{document}',    [StaffController::class, 'deleteDocument'])->name('staff.documents.delete');
        });

    /*
    |--------------------------------------------------------------------------
    | Super Admin routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super-admin')
        ->prefix('super-admin')
        ->name('super-admin.')
        ->group(function () {
            Route::resource('schools', SchoolController::class);
            Route::patch('schools/{school}/suspend', [SchoolController::class, 'suspend'])->name('schools.suspend');
            Route::patch('schools/{school}/activate', [SchoolController::class, 'activate'])->name('schools.activate');
        });
});
