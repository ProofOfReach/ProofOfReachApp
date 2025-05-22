# Shadcn/UI Implementation Plan

## Priority Components
1. **Navigation Components**
   - Replace Navbar buttons with shadcn/ui Button
   - Update sidebar navigation items

2. **Dashboard Components**
   - Update card components in the dashboard
   - Replace action buttons in dashboard tables and lists

3. **Form Components**
   - Update all form inputs using shadcn/ui Input, Textarea
   - Implement Form, FormField structure for all forms
   - Replace buttons in forms with Button components

4. **Selection Components**
   - Replace dropdowns with Select component
   - Update checkboxes with Checkbox component
   
5. **Modal and Dialog Components**
   - Implement standardized dialogs across the app

## Implementation Strategy
1. Start with high-visibility pages first (homepage, dashboard)
2. Focus on one component type at a time (all buttons first, then inputs, etc.)
3. Update related components together (all form elements at once)
4. Test thoroughly after each major component group update

## Conversion Guide
- `btn-primary` → `<Button>...</Button>`
- `btn-secondary` → `<Button variant="secondary">...</Button>`
- `btn-outline` → `<Button variant="outline">...</Button>`
- `btn-danger` → `<Button variant="destructive">...</Button>`
- `btn-link` → `<Button variant="link">...</Button>`
- `input-field` → `<Input ... />`
- Form containers → Use the Form, FormField, FormItem, FormLabel pattern