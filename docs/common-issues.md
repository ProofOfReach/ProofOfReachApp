# Common Issues and Solutions

## Testing Guide

### Testing Custom Layouts

When testing pages that use Next.js custom layout pattern, keep these points in mind:

1. Use the `getLayout` function in your test by simulating how `_app.tsx` would use it:
   ```tsx
   const { container } = render(SomePage.getLayout(<SomePage />));
   ```

2. Check for duplicate navigation elements to avoid the double navbar issue:
   ```tsx
   const navElements = container.querySelectorAll('nav');
   expect(navElements.length).toBeLessThanOrEqual(1);
   ```

3. When mocking router paths that affect layout rendering, make sure to restore the original router after testing:
   ```tsx
   const originalUseRouter = require('next/router').useRouter;
   require('next/router').useRouter = () => ({
     pathname: '/some-path',
     // other router properties
   });
   
   // Run your test...
   
   // Clean up
   require('next/router').useRouter = originalUseRouter;
   ```

## UI Issues

### Double Navbar Problem

**Problem:** Pages showing two navbars instead of one.

**Cause:** This happens when a page is wrapped in the Layout component twice: once explicitly in the page component, and once implicitly by the default layout in `_app.tsx`.

**Solution:** Use Next.js's custom layout pattern:

1. Change the page type from `NextPage` to `NextPageWithLayout` 
2. Remove the direct Layout wrapper from the component's return statement
3. Add a custom `getLayout` function to the page

**Example Implementation:**

```tsx
import { ReactElement } from 'react';
import { NextPageWithLayout } from './_app';
import Layout from '../components/Layout';

const SomePage: NextPageWithLayout = () => {
  return (
    <div>
      {/* Page content without Layout wrapper */}
      <h1>Page Title</h1>
      <p>Page content goes here</p>
    </div>
  );
};

// Define the custom layout for this page
SomePage.getLayout = (page: ReactElement) => {
  return (
    <Layout
      title="Page Title"
      description="Page description"
    >
      {page}
    </Layout>
  );
};

export default SomePage;
```

This ensures that the page uses the layout system correctly, preventing double wrapping that causes the double navbar.

## Best Practices for Layout Implementation

To avoid the double navbar issue and similar layout problems, follow these best practices:

1. **Use the Next.js layout pattern consistently**:
   - Define layout types in `_app.tsx` 
   - Use `getLayout` property on page components
   - Never directly wrap page content in a Layout component

2. **Be cautious with conditional rendering in layouts**:
   - Use path-based logic carefully
   - Test multiple navigation paths
   - Consider creating specialized layout components for different sections

3. **Maintain clear component hierarchy**:
   - Keep Layout components simple and focused
   - Avoid deeply nested layout wrapping
   - Document the intended structure

4. **Testing layout components**:
   - Always test layout components with route-specific mocks
   - Verify the correct elements are rendered based on route
   - Add tests for edge cases and transitions between routes