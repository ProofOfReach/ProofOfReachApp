#!/bin/bash

# Fix all DashboardLayout references in getLayout functions
find src/pages -name "*.tsx" -exec sed -i 's/return <DashboardLayout[^>]*>{page}<\/DashboardLayout>;/return page;/g' {} \;

echo "Fixed all DashboardLayout references in getLayout functions"