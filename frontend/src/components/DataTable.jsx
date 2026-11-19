export default function DataTable({ columns, rows, sortBy, order, onSort, onRowClick }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((c) => {
            const key = c.sortKey || c.key;
            return (
              <th
                key={c.key}
                className={c.sortable ? 'sortable' : ''}
                onClick={() => c.sortable && onSort(key)}
              >
                {c.label}
                {c.sortable && sortBy === key && (order === 'asc' ? ' ▲' : ' ▼')}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr><td colSpan={columns.length} className="muted">No records found</td></tr>
        )}
        {rows.map((row) => (
          <tr
            key={row.id}
            className={onRowClick ? 'clickable' : ''}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((c) => (
              <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}