<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #222; }
    h2 { margin-bottom: 4px; }
    p  { margin: 0 0 12px; color: #555; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #4f46e5; color: #fff; padding: 6px 8px; text-align: left; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    .present { color: #16a34a; font-weight: 600; }
    .absent  { color: #dc2626; font-weight: 600; }
    .late    { color: #d97706; font-weight: 600; }
</style>
</head>
<body>
<h2>Attendance Report</h2>
<p>Generated: {{ now()->format('d M Y H:i') }} &nbsp;|&nbsp; Total records: {{ $records->count() }}</p>
<table>
    <thead>
        <tr>
            <th>#</th>
            <th>Student</th>
            <th>Admission No</th>
            <th>Class</th>
            <th>Date</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach($records as $i => $rec)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $rec->student?->first_name }} {{ $rec->student?->last_name }}</td>
            <td>{{ $rec->student?->admission_no }}</td>
            <td>{{ $rec->schoolClass?->name }}</td>
            <td>{{ \Carbon\Carbon::parse($rec->date)->format('d M Y') }}</td>
            <td class="{{ $rec->status }}">{{ ucfirst($rec->status) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
</body>
</html>
