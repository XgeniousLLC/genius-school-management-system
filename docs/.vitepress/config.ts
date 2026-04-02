import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Genius SMS',
  description: 'User Guide for Genius School Management System',
  base: '/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      {
        text: 'Role Guides',
        items: [
          { text: 'School Admin', link: '/school-admin/' },
          { text: 'Teacher', link: '/teacher/' },
          { text: 'Accountant', link: '/accountant/' },
          { text: 'Student', link: '/student/' },
          { text: 'Parent', link: '/parent/' },
        ],
      },
    ],

    sidebar: [
      {
        text: '🚀 Getting Started',
        items: [
          { text: 'Welcome', link: '/' },
          { text: 'Logging In', link: '/getting-started' },
          { text: 'Navigating the System', link: '/navigation' },
        ],
      },
      {
        text: '🏫 School Admin Guide',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/school-admin/' },
          { text: 'Initial School Setup', link: '/school-admin/setup' },
          { text: 'Managing Students', link: '/school-admin/students' },
          { text: 'Managing Staff', link: '/school-admin/staff' },
          { text: 'Attendance', link: '/school-admin/attendance' },
          { text: 'Timetable', link: '/school-admin/timetable' },
          { text: 'Examinations & Results', link: '/school-admin/exams' },
          { text: 'Fee Management', link: '/school-admin/fees' },
          { text: 'Library', link: '/school-admin/library' },
          { text: 'Transport', link: '/school-admin/transport' },
          { text: 'Hostel', link: '/school-admin/hostel' },
          { text: 'HR & Payroll', link: '/school-admin/hr' },
          { text: 'Admissions & Visitors', link: '/school-admin/admissions' },
          { text: 'Communication', link: '/school-admin/communication' },
          { text: 'Reports', link: '/school-admin/reports' },
          { text: 'School Settings', link: '/school-admin/settings' },
        ],
      },
      {
        text: '👨‍🏫 Teacher Guide',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/teacher/' },
          { text: 'Taking Attendance', link: '/teacher/attendance' },
          { text: 'Homework & Lesson Plans', link: '/teacher/homework' },
          { text: 'Entering Exam Marks', link: '/teacher/marks' },
          { text: 'Timetable & Schedule', link: '/teacher/timetable' },
          { text: 'Communication', link: '/teacher/communication' },
        ],
      },
      {
        text: '💰 Accountant Guide',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/accountant/' },
          { text: 'Collecting Fees', link: '/accountant/fees' },
          { text: 'Fee Structures', link: '/accountant/structures' },
          { text: 'Payroll', link: '/accountant/payroll' },
          { text: 'Finance Reports', link: '/accountant/reports' },
        ],
      },
      {
        text: '🎓 Student Guide',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/student/' },
          { text: 'My Dashboard', link: '/student/dashboard' },
          { text: 'My Timetable', link: '/student/timetable' },
          { text: 'My Attendance', link: '/student/attendance' },
          { text: 'My Results', link: '/student/results' },
          { text: 'My Fees', link: '/student/fees' },
          { text: 'Homework', link: '/student/homework' },
        ],
      },
      {
        text: '👨‍👩‍👧 Parent Guide',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/parent/' },
          { text: 'My Dashboard', link: '/parent/dashboard' },
          { text: "Children's Attendance", link: '/parent/attendance' },
          { text: 'Results & Grades', link: '/parent/results' },
          { text: 'Fee Status', link: '/parent/fees' },
          { text: 'Announcements', link: '/parent/announcements' },
        ],
      },
    ],

    search: { provider: 'local' },

    footer: {
      message: 'Genius School Management System',
      copyright: 'Copyright © 2025 xgenious',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xgenious/genius-sms' },
    ],
  },
})
