# DataTable Component

The `DataTable` component is a reusable table component with built-in sorting, filtering, and styling features.

## Features

- Clean, modern styling with lower contrast borders
- Column dividers for visual separation 
- Sortable columns with visual indicators
- Search filtering capability
- Custom cell renderers
- Empty state messaging
- Consistent with shadcn/ui design patterns

## Usage

```tsx
import { DataTable } from "@/components/ui/data-table/DataTable";

// Define column configuration
const columns = [
  {
    header: "Name",
    accessorKey: "name",
    sortable: true,
    initialWidth: 200
  },
  {
    header: "Email",
    accessorKey: "email",
    sortable: true
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {row.status}
      </span>
    )
  }
];

// Sample data
const data = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "inactive" },
  // ...more data
];

// Render the component
function UsersTable() {
  return (
    <DataTable
      columns={columns}
      data={data}
      caption="Users"
      searchField="name"
      emptyMessage="No users found."
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `Column<T>[]` | Array of column configurations |
| `data` | `T[]` | Array of data objects |
| `caption` | `string` (optional) | Table caption |
| `searchField` | `keyof T` (optional) | Property to use for search filtering |
| `emptyMessage` | `string` (optional) | Message to display when no data is available |

## Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `header` | `string` | Column header text |
| `accessorKey` | `keyof T` | Property key to access data |
| `sortable` | `boolean` (optional) | Whether column is sortable |
| `cell` | `(row: T) => ReactNode` (optional) | Custom cell renderer |
| `initialWidth` | `number` (optional) | Initial column width in pixels |

## Examples

### Basic Table

```tsx
<DataTable columns={columns} data={users} />
```

### Table with Search

```tsx
<DataTable columns={columns} data={products} searchField="name" />
```

### Table with Custom Cell Renderers

```tsx
const columns = [
  // ...
  {
    header: "Actions",
    accessorKey: "id",
    cell: (row) => (
      <div className="flex space-x-2">
        <button onClick={() => editItem(row.id)}>Edit</button>
        <button onClick={() => deleteItem(row.id)}>Delete</button>
      </div>
    )
  }
];
```

### Empty Table State

```tsx
<DataTable 
  columns={columns} 
  data={[]} 
  emptyMessage="No data available. Add some items to get started."
/>
```