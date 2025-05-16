// Direct import may not work with TypeScript code, we'll use a workaround
// Assuming the accessControl module is properly built by Next.js

// Mock the necessary dependencies
const logger = {
  warn: () => {},
  info: () => {},
  debug: () => {},
  error: () => {}
};

// Create a simplified version of the necessary functions
function isValidUserRole(role) {
  return ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'].includes(role);
}

// Import the implementation directly from accessControl.ts
const { accessControl } = require('./src/lib/accessControl');
const { getRoleCapabilities } = accessControl;

// Test inheritance
console.log("Testing inheritance in capabilities...");

// Get publisher capabilities with metadata
const publisherCapabilities = getRoleCapabilities('publisher', true);

console.log("UPDATE_PLACEMENT_SETTINGS capability:", JSON.stringify(publisherCapabilities.UPDATE_PLACEMENT_SETTINGS, null, 2));
console.log("DELETE_PLACEMENT capability:", JSON.stringify(publisherCapabilities.DELETE_PLACEMENT, null, 2));

// Test multi-level inheritance
console.log("\nTesting multi-level inheritance...");
console.log("VIEW_ADVANCED_ANALYTICS capability:", JSON.stringify(publisherCapabilities.VIEW_ADVANCED_ANALYTICS, null, 2));
console.log("EXPORT_ANALYTICS capability:", JSON.stringify(publisherCapabilities.EXPORT_ANALYTICS, null, 2));

// Test all capabilities
console.log("\nAll capabilities for publisher:", Object.keys(publisherCapabilities)
  .filter(key => publisherCapabilities[key].granted)
  .map(key => ({ 
    permission: key, 
    inheritedFrom: publisherCapabilities[key].inheritedFrom || 'direct'
  }))
);