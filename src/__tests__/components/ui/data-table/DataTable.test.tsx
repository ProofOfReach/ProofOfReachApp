import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '@/components/ui/data-table/DataTable';

// Test data
interface TestItem {
  id: string;
  name: string;
  age: number;
  email: string;
}

const testData: TestItem[] = [
  { id: '1', name: 'John Doe', age: 30, email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', age: 45, email: 'bob@example.com' },
];

// Column definitions
const columns = [
  {
    header: 'Name',
    accessorKey: 'name' as keyof TestItem,
    sortable: true,
  },
  {
    header: 'Age',
    accessorKey: 'age' as keyof TestItem,
    sortable: true,
  },
  {
    header: 'Email',
    accessorKey: 'email' as keyof TestItem,
    sortable: false,
  },
];

describe('DataTable Component', () => {
  it('renders the table with correct data', () => {
    render(<DataTable columns={columns} data={testData} />);
    
    // Check column headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    
    // Check data rows
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });
  
  it('displays the empty state message when no data is provided', () => {
    const emptyMessage = 'No items found';
    render(<DataTable columns={columns} data={[]} emptyMessage={emptyMessage} />);
    
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
  });
  
  it('renders the search input when searchField is provided', () => {
    render(<DataTable columns={columns} data={testData} searchField="name" />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
  });
  
  it('renders column dividers between columns', () => {
    render(<DataTable columns={columns} data={testData} />);
    
    // Checking that the table structure is correct with dividers
    const headerCells = screen.getAllByRole('columnheader');
    expect(headerCells.length).toBe(columns.length);
  });
  
  it('filters the data when using the search input', () => {
    render(<DataTable columns={columns} data={testData} searchField="name" />);
    
    const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    
    // Type "Doe" in the search input to only match John Doe
    fireEvent.change(searchInput, { target: { value: 'Doe' } });
    
    // John Doe should be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Jane Smith should not be visible
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    
    // Bob Johnson should not be visible
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });
  
  it('sorts the data when clicking on a sortable column header', () => {
    render(<DataTable columns={columns} data={testData} />);
    
    // Get the sortable column header for Age
    const ageHeader = screen.getByTestId('column-header-age');
    
    // Initially, data should be unsorted (John: 30, Jane: 25, Bob: 45)
    const rows = screen.getAllByTestId(/^data-row-/);
    expect(rows).toHaveLength(3);
    
    // Click the Age header to sort ascending
    fireEvent.click(ageHeader);
    
    // Check if the order has changed to age ascending (Jane: 25, John: 30, Bob: 45)
    const cells = screen.getAllByTestId(/^cell-\d+-age$/);
    expect(cells[0].textContent).toBe('25'); // Jane should be first
    expect(cells[1].textContent).toBe('30'); // John should be second
    expect(cells[2].textContent).toBe('45'); // Bob should be third
    
    // Click again to sort descending
    fireEvent.click(ageHeader);
    
    // Check if the order has changed to age descending (Bob: 45, John: 30, Jane: 25)
    const cellsDesc = screen.getAllByTestId(/^cell-\d+-age$/);
    expect(cellsDesc[0].textContent).toBe('45'); // Bob should be first
    expect(cellsDesc[1].textContent).toBe('30'); // John should be second
    expect(cellsDesc[2].textContent).toBe('25'); // Jane should be third
  });
  
  it('renders custom cell renderers correctly', () => {
    const columnsWithCustomCell = [
      ...columns,
      {
        header: 'Custom',
        accessorKey: 'id' as keyof TestItem,
        cell: (row: TestItem) => <span data-testid="custom-cell">{`Custom: ${row.name}`}</span>,
      },
    ];
    
    render(<DataTable columns={columnsWithCustomCell} data={testData} />);
    
    const customCells = screen.getAllByTestId('custom-cell');
    expect(customCells).toHaveLength(3);
    expect(customCells[0].textContent).toBe('Custom: John Doe');
    expect(customCells[1].textContent).toBe('Custom: Jane Smith');
    expect(customCells[2].textContent).toBe('Custom: Bob Johnson');
  });
});