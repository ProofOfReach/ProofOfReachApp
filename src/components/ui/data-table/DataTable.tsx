import { UserRole } from "@/types/role";
import React, { useState } from 'react';
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp } from 'react-feather';

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  initialWidth?: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  caption?: string;
  searchField?: keyof T;
  emptyMessage?: string;
}

export function DataTable<T extends Record<UserRole, any>>({
  columns,
  data,
  caption,
  searchField,
  emptyMessage = "No records found."
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  
  // Define default column widths from props if provided
  const columnWidths: Record<string, number> = {};
  columns.forEach((column) => {
    const key = String(column.accessorKey);
    columnWidths[key] = column.initialWidth || 150; // Default width
  });
  
  // Remove the showSearch state since we're showing the search input directly
  
  // Filtering logic
  const filteredData = React.useMemo(() => {
    if (!searchQuery || !searchField) return data;
    
    return data.filter(row => {
      const fieldValue = String(row[searchField]).toLowerCase();
      return fieldValue.includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery, searchField]);

  // Sorting logic
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];
      
      if (aValue === bValue) return 0;
      
      // Handle different data types
      const result = 
        typeof aValue === 'string' ? aValue.localeCompare(String(bValue)) :
        aValue > bValue ? 1 : -1;
      
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [filteredData, sortConfig]);

  // Handle sorting toggle
  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    
    setSortConfig({
      key: column.accessorKey,
      direction: 
        sortConfig.key === column.accessorKey && sortConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc',
    });
  };

  // Get sort direction for a column
  const getSortDirection = (column: Column<T>) => {
    if (!column.sortable) return null;
    if (sortConfig.key !== column.accessorKey) return null;
    return sortConfig.direction;
  };
  
  // Get sort direction for a column helper function
  const getSortIndicator = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    if (sortConfig.key === column.accessorKey) {
      return sortConfig.direction === 'asc' ? 
        <ChevronUp className="h-4 w-4" /> : 
        <ChevronDown className="h-4 w-4" />;
    }
    
    return <div className="h-4 w-4 opacity-0">|</div>;
  };

  return (
    <div className="w-full">
      {/* Search input in the top left of the table */}
      {searchField && (
        <div className="flex items-center mb-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
              data-testid="data-table-search"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-gray-100 dark:border-gray-800">
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={index} 
                  className={`${column.sortable ? 'cursor-pointer select-none' : ''} relative`}
                  onClick={() => handleSort(column)}
                  data-testid={`column-header-${String(column.accessorKey)}`}
                  style={{ 
                    width: columnWidths[String(column.accessorKey)] ? `${columnWidths[String(column.accessorKey)]}px` : 'auto',
                    minWidth: '80px' // Minimum width for columns
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span>
                        {getSortIndicator(column)}
                      </span>
                    )}
                  </div>
                  
                  {/* Column divider */}
                  {index < columns.length - 1 && (
                    <div className="absolute right-0 top-0 h-full">
                      <div className="absolute right-0 top-0 h-full w-px bg-gray-300 dark:bg-gray-600" />
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, rowIndex) => (
                <TableRow key={rowIndex} data-testid={`data-row-${rowIndex}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} data-testid={`cell-${rowIndex}-${String(column.accessorKey)}`}>
                      {column.cell ? column.cell(row) : String(row[column.accessorKey] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}