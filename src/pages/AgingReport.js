import React, { useMemo } from 'react';
import PageHeader from '../components/Common/PageHeader';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';

export default function AgingReport() {
  const { user } = useUser();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await supaFetch('invoices?select=*,customers(name)&order=due_date.asc', { method: 'GET' }, user?.company_id);
        const data = res.ok ? await res.json() : [];
        if (mounted) setRows(Array.isArray(data)?data:[]);
      } finally { setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [user?.company_id]);

  const now = new Date();
  const buckets = useMemo(() => {
    const b = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    rows.forEach(inv => {
      if (['PAID','VOID'].includes(inv.status || inv.invoice_status)) return;
      const due = inv.due_at || inv.due_date; if (!due) return;
      const d = Math.max(0, Math.floor((now - new Date(due)) / (1000*60*60*24)));
      if (d <= 30) b['0-30'] += Number(inv.total_amount||0);
      else if (d <= 60) b['31-60'] += Number(inv.total_amount||0);
      else if (d <= 90) b['61-90'] += Number(inv.total_amount||0);
      else b['90+'] += Number(inv.total_amount||0);
    });
    return b;
  }, [rows]);

  const formatCurrency = (n) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n||0);

  const exportCSV = () => {
    const lines = ['Invoice #,Customer,Status,Days Overdue,Amount,Due'];
    rows.forEach(inv => {
      const due = inv.due_at || inv.due_date; if (!due) return;
      const d = Math.max(0, Math.floor((now - new Date(due)) / (1000*60*60*24)));
      if (d <= 0) return; // only overdue
      const cols = [inv.invoice_number, inv.customers?.name||'', inv.status||inv.invoice_status||'', d, (Number(inv.total_amount||0)).toFixed(2), due]
        .map(v => '"'+String(v ?? '').replaceAll('"','""')+'"');
      lines.push(cols.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `aging_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aging Report"
        subtitle="Past due invoices summarized into buckets"
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Invoices', to: '/invoices' }, { label: 'Aging Report' }]}
      >
        <button className="btn-secondary" onClick={exportCSV}>Export CSV</button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(buckets).map(([k,v]) => (
          <div key={k} className="bg-white border rounded p-4">
            <div className="text-sm text-gray-500">{k} days</div>
            <div className="text-2xl font-semibold">{formatCurrency(v)}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Days Overdue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(inv => {
              const due = inv.due_at || inv.due_date; if (!due) return null;
              const d = Math.max(0, Math.floor((now - new Date(due)) / (1000*60*60*24)));
              if (d <= 0) return null;
              return (
                <tr key={inv.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{inv.invoice_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{inv.customers?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{inv.status || inv.invoice_status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{d}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(inv.total_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{new Date(due).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

