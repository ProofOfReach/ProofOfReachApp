import React from 'react';
import { clsx } from 'clsx';

interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

function DataTable<T>({ 
  data, 
  columns, 
  className,
  onRowClick,
  loading = false,
  emptyMessage = "No data available"
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={clsx("rounded-md border", className)}>
        <div className="p-8 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={clsx("rounded-md border", className)}>
        <div className="p-8 text-center text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("rounded-md border", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={clsx(
                    "px-4 py-3 text-left text-sm font-medium text-gray-900",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={clsx(
                  "border-b transition-colors hover:bg-gray-50/50",
                  onRowClick && "cursor-pointer"
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={clsx(
                      "px-4 py-3 text-sm text-gray-900",
                      column.className
                    )}
                  >
                    {column.cell 
                      ? column.cell({ row: { original: row } })
                      : column.accessorKey 
                        ? String(row[column.accessorKey] ?? '')
                        : ''
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { DataTable };
export type { DataTableProps, Column };