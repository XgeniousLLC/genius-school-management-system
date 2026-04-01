import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, School, Users, GraduationCap, UserCog,
    CalendarDays, BookOpen, ClipboardList, DollarSign,
    Library, Bus, Home, Package, MessageSquare, BarChart3,
    Settings, ChevronLeft, ChevronRight, Layers, Clock, CalendarOff,
    Building2, BadgeCheck, NotebookPen, Video, Megaphone, Mail, Send, Bell,
    PieChart, FileText, TrendingUp, Wrench, ShieldCheck, Plug,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/Stores/useUIStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PageProps } from '@/Types';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    roles?: string[];
    exact?: boolean;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        title: 'System',
        items: [
            { label: 'Dashboard',   href: '/dashboard',             icon: LayoutDashboard, exact: true },
            { label: 'Schools',     href: '/super-admin/schools',   icon: School,          roles: ['super-admin'] },
        ],
    },
    {
        title: 'School Setup',
        items: [
            { label: 'Classes',     href: '/school/classes',  icon: GraduationCap,  roles: ['super-admin','school-admin','principal'] },
            { label: 'Sections',    href: '/school/sections', icon: Layers,         roles: ['super-admin','school-admin','principal'] },
            { label: 'Subjects',    href: '/school/subjects', icon: BookOpen,       roles: ['super-admin','school-admin','principal'] },
            { label: 'Shifts',      href: '/school/shifts',   icon: Clock,          roles: ['super-admin','school-admin','principal'] },
            { label: 'Holidays',    href: '/school/holidays', icon: CalendarOff,    roles: ['super-admin','school-admin','principal'] },
        ],
    },
    {
        title: 'Academic',
        items: [
            { label: 'Students',    href: '/school/students', icon: GraduationCap, roles: ['super-admin','school-admin','principal','teacher','receptionist','accountant'] },
            { label: 'Staff',       href: '/school/staff',   icon: UserCog,        roles: ['super-admin','school-admin','principal'] },
            { label: 'Timetable',   href: '/school/timetable', icon: CalendarDays,  roles: ['super-admin','school-admin','principal','teacher'] },
            { label: 'Attendance',  href: '/school/attendance', icon: ClipboardList, roles: ['super-admin','school-admin','principal','teacher'] },
            { label: 'Examinations',href: '/school/exams',    icon: BookOpen,       roles: ['super-admin','school-admin','principal','teacher','accountant'] },
        ],
    },
    {
        title: 'HR Setup',
        items: [
            { label: 'Departments',  href: '/school/departments',  icon: Building2,   roles: ['super-admin','school-admin','principal'] },
            { label: 'Designations', href: '/school/designations', icon: BadgeCheck,  roles: ['super-admin','school-admin','principal'] },
            { label: 'Leave Requests', href: '/school/hr/leaves', icon: CalendarDays, roles: ['super-admin','school-admin','principal'] },
            { label: 'Payroll',      href: '/school/hr/payroll',   icon: DollarSign,  roles: ['super-admin','school-admin','accountant'] },
        ],
    },
    {
        title: 'Finance',
        items: [
            { label: 'Fee Payments',   href: '/school/fees/payments',   icon: DollarSign,  roles: ['super-admin','school-admin','accountant'] },
            { label: 'Fee Structures', href: '/school/fees/structures',  icon: BarChart3,   roles: ['super-admin','school-admin','accountant'] },
            { label: 'Fee Categories', href: '/school/fees/categories',  icon: ClipboardList, roles: ['super-admin','school-admin','accountant'] },
        ],
    },
    {
        title: 'Learning',
        items: [
            { label: 'Homework',      href: '/school/homework',                icon: NotebookPen,   roles: ['super-admin','school-admin','principal','teacher'] },
            { label: 'Lesson Plans',  href: '/school/homework/lesson-plans',   icon: ClipboardList, roles: ['super-admin','school-admin','principal','teacher'] },
            { label: 'Syllabus',      href: '/school/homework/syllabi',        icon: BookOpen,      roles: ['super-admin','school-admin','principal','teacher'] },
            { label: 'Online Classes',href: '/school/homework/online-classes', icon: Video,         roles: ['super-admin','school-admin','principal','teacher'] },
        ],
    },
    {
        title: 'Facilities',
        items: [
            { label: 'Library',     href: '/school/library/books',       icon: Library,  roles: ['super-admin','school-admin','principal','librarian'] },
            { label: 'Transport',   href: '/school/transport/vehicles',  icon: Bus,      roles: ['super-admin','school-admin','driver'] },
            { label: 'Hostel',      href: '/school/hostel',              icon: Home,     roles: ['super-admin','school-admin','warden'] },
            { label: 'Inventory',   href: '/school/inventory/items',     icon: Package,  roles: ['super-admin','school-admin','store-manager'] },
        ],
    },
    {
        title: 'Communication',
        items: [
            { label: 'Announcements',    href: '/school/communication/announcements',   icon: Megaphone,     roles: ['super-admin','school-admin','principal','teacher'] },
            { label: 'Messages',         href: '/school/communication/messages',         icon: MessageSquare, roles: ['super-admin','school-admin','principal','teacher','accountant','librarian'] },
            { label: 'SMS/Email Blast',  href: '/school/communication/blast',            icon: Send,          roles: ['super-admin','school-admin','principal'] },
            { label: 'Email Templates',  href: '/school/communication/email-templates',  icon: Mail,          roles: ['super-admin','school-admin'] },
            { label: 'Notifications',    href: '/school/communication/notifications',    icon: Bell,          roles: ['super-admin','school-admin','principal','teacher','accountant','librarian'] },
        ],
    },
    {
        title: 'Reports',
        items: [
            { label: 'Dashboard',        href: '/school/reports/dashboard',  icon: PieChart,    roles: ['super-admin','school-admin','principal','teacher','accountant'] },
            { label: 'Attendance',       href: '/school/reports/attendance', icon: ClipboardList,roles: ['super-admin','school-admin','principal','teacher'] },
            { label: 'Academic',         href: '/school/reports/academic',   icon: TrendingUp,  roles: ['super-admin','school-admin','principal','teacher'] },
            { label: 'Finance',          href: '/school/reports/finance',    icon: DollarSign,  roles: ['super-admin','school-admin','accountant'] },
            { label: 'Custom Report',    href: '/school/reports/custom',     icon: FileText,    roles: ['super-admin','school-admin','principal','accountant'] },
            { label: 'Audit Log',        href: '/school/reports/audit-log',  icon: ShieldCheck, roles: ['super-admin','school-admin'] },
        ],
    },
    {
        title: 'Admin',
        items: [
            { label: 'Integrations', href: '/school/settings/integrations', icon: Plug,     roles: ['super-admin','school-admin'] },
            { label: 'Settings',     href: '/settings',                     icon: Settings, roles: ['school-admin','super-admin'] },
            { label: 'Users',        href: '/super-admin/users',            icon: Users,    roles: ['super-admin'] },
        ],
    },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
    const { url } = usePage();
    const isActive = item.exact ? url === item.href : url.startsWith(item.href);

    const link = (
        <Link
            href={item.href}
            className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                'hover:bg-slate-100 dark:hover:bg-slate-800',
                isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400',
                collapsed && 'justify-center px-2',
            )}
        >
            <item.icon className={cn('shrink-0', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500', 'w-[18px] h-[18px]')} />
            {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>
    );

    if (collapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
        );
    }
    return link;
}

export default function Sidebar() {
    const { auth } = usePage<PageProps>().props;
    const { sidebarCollapsed, toggleCollapsed } = useUIStore();
    const role = auth.user?.role ?? '';

    const filteredGroups = navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) =>
                !item.roles || item.roles.includes(role),
            ),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-200 shrink-0',
                    sidebarCollapsed ? 'w-[60px]' : 'w-60',
                )}
            >
                {/* Logo */}
                <div className={cn('flex items-center h-14 px-4 border-b border-slate-200 dark:border-slate-800', sidebarCollapsed && 'justify-center px-2')}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                    {!sidebarCollapsed && (
                        <span className="ml-2.5 font-bold text-slate-900 dark:text-white text-sm tracking-tight">Genius SMS</span>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
                    {filteredGroups.map((group) => (
                        <div key={group.title}>
                            {!sidebarCollapsed && (
                                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                                    {group.title}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavLink key={item.href} item={item} collapsed={sidebarCollapsed} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Collapse toggle */}
                <button
                    onClick={toggleCollapsed}
                    className="absolute -right-3 top-16 flex items-center justify-center w-6 h-6 rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors z-10"
                    aria-label="Toggle sidebar"
                >
                    {sidebarCollapsed
                        ? <ChevronRight className="w-3 h-3 text-slate-500" />
                        : <ChevronLeft className="w-3 h-3 text-slate-500" />
                    }
                </button>
            </aside>
        </TooltipProvider>
    );
}
