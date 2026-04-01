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
    .paid     { color: #16a34a; font-weight: 600; }
    .pending  { color: #d97706; font-weight: 600; }
    .partial  { color: #2563eb; font-weight: 600; }
    .total-row { font-weight: 700; background: #f0fdf4; }
</style>
</head>
<body>
<h2>Finance Report — Fee Payments</h2>
<p>Period: {{ \Carbon\Carbon::parse($from)->format('d M Y') }} to {{ \Carbon\Carbon::parse($to)->format('d M Y') }}
   &nbsp;|&nbsp; Total collected: {{ number_format($payments->sum('amount_paid'), 2) }}</p>
<table>
    <thead>
        <tr>
            <th>#</th>
            <th>Student</th>
            <th>Admission No</th>
            <th>Total Amount</th>
            <th>Amount Paid</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Paid At</th>
        </tr>
    </thead>
    <tbody>
        @foreach($payments as $i => $p)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $p->student?->first_name }} {{ $p->student?->last_name }}</td>
            <td>{{ $p->student?->admission_no }}</td>
            <td>{{ number_format($p->total_amount, 2) }}</td>
            <td>{{ number_format($p->amount_paid, 2) }}</td>
            <td>{{ number_format($p->total_amount - $p->amount_paid, 2) }}</td>
            <td class="{{ $p->status }}">{{ ucfirst($p->status) }}</td>
            <td>{{ $p->paid_at ? \Carbon\Carbon::parse($p->paid_at)->format('d M Y') : '—' }}</td>
        </tr>
        @endforeach
        <tr class="total-row">
            <td colspan="4">Total</td>
            <td>{{ number_format($payments->sum('amount_paid'), 2) }}</td>
            <td>{{ number_format($payments->sum(fn($p) => $p->total_amount - $p->amount_paid), 2) }}</td>
            <td colspan="2"></td>
        </tr>
    </tbody>
</table>
</body>
</html>
