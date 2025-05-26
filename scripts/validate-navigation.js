#!/usr/bin/env node

/**
 * Navigation Validation Script
 * 
 * This script validates all navigation routes across different roles
 * to ensure no runtime errors occur when accessing menu items.
 * 
 * Usage: node scripts/validate-navigation.js
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const TIMEOUT = 10000; // 10 seconds

// Role-based routes to test
const ROUTES_BY_ROLE = {
  viewer: [
    '/',
    '/dashboard',
    '/dashboard/wallet',
    '/how-it-works',
    '/contact'
  ],
  advertiser: [
    '/',
    '/dashboard',
    '/dashboard/wallet',
    '/dashboard/campaigns',
    '/dashboard/campaigns/create',
    '/dashboard/billing',
    '/how-it-works',
    '/contact'
  ],
  publisher: [
    '/',
    '/dashboard',
    '/dashboard/wallet',
    '/dashboard/ad-spaces',
    '/dashboard/ad-spaces/create',
    '/dashboard/earnings',
    '/how-it-works',
    '/contact'
  ],
  admin: [
    '/',
    '/dashboard',
    '/dashboard/wallet',
    '/dashboard/campaigns',
    '/dashboard/ad-spaces',
    '/dashboard/admin',
    '/dashboard/admin/users',
    '/dashboard/admin/campaigns',
    '/dashboard/admin/settings',
    '/how-it-works',
    '/contact'
  ],
  stakeholder: [
    '/',
    '/dashboard',
    '/dashboard/wallet',
    '/dashboard/reports',
    '/dashboard/reports/overview',
    '/dashboard/reports/performance',
    '/how-it-works',
    '/contact'
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}=== ${message} ===${colors.reset}`);
}

// HTTP request function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestModule = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Navigation-Validator/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options.headers
      }
    };

    const req = requestModule.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Request failed for ${url}: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout for ${url}`));
    });

    req.end();
  });
}

// Check if response indicates an error
function hasRuntimeError(response) {
  const { statusCode, body } = response;
  
  // Check for HTTP errors
  if (statusCode >= 500) {
    return { hasError: true, type: 'HTTP_ERROR', details: `Status: ${statusCode}` };
  }
  
  // Check for Next.js build errors
  if (body.includes('Error:') && body.includes('at Object.')) {
    return { hasError: true, type: 'BUILD_ERROR', details: 'Next.js build error detected' };
  }
  
  // Check for React errors
  if (body.includes('Unhandled Runtime Error') || body.includes('Error: ')) {
    return { hasError: true, type: 'RUNTIME_ERROR', details: 'React runtime error detected' };
  }
  
  // Check for module not found errors
  if (body.includes('Module not found') || body.includes('Cannot resolve module')) {
    return { hasError: true, type: 'MODULE_ERROR', details: 'Module resolution error detected' };
  }
  
  // Check for TypeScript errors in development
  if (body.includes('TypeScript error') || body.includes('TS')) {
    return { hasError: true, type: 'TYPESCRIPT_ERROR', details: 'TypeScript error detected' };
  }
  
  return { hasError: false };
}

// Test a single route
async function testRoute(route, role = 'viewer') {
  try {
    const url = `${BASE_URL}${route}`;
    const response = await makeRequest(url);
    
    const errorCheck = hasRuntimeError(response);
    
    if (errorCheck.hasError) {
      logError(`${route} (${role}): ${errorCheck.type} - ${errorCheck.details}`);
      return { route, role, success: false, error: errorCheck };
    } else if (response.statusCode === 200) {
      logSuccess(`${route} (${role}): OK`);
      return { route, role, success: true };
    } else if (response.statusCode === 302 || response.statusCode === 301) {
      logInfo(`${route} (${role}): Redirect (${response.statusCode})`);
      return { route, role, success: true, redirect: true };
    } else if (response.statusCode === 404) {
      logWarning(`${route} (${role}): Not Found (404)`);
      return { route, role, success: false, error: { type: 'NOT_FOUND', details: '404 Not Found' }};
    } else {
      logWarning(`${route} (${role}): Unexpected status ${response.statusCode}`);
      return { route, role, success: false, error: { type: 'UNEXPECTED_STATUS', details: `Status: ${response.statusCode}` }};
    }
  } catch (error) {
    logError(`${route} (${role}): ${error.message}`);
    return { route, role, success: false, error: { type: 'REQUEST_ERROR', details: error.message }};
  }
}

// Test all routes for a specific role
async function testRole(role) {
  logHeader(`Testing ${role.toUpperCase()} Role`);
  
  const routes = ROUTES_BY_ROLE[role] || [];
  const results = [];
  
  for (const route of routes) {
    const result = await testRoute(route, role);
    results.push(result);
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

// Generate summary report
function generateSummary(allResults) {
  logHeader('Validation Summary');
  
  const summary = {
    total: 0,
    successful: 0,
    failed: 0,
    redirects: 0,
    errors: {}
  };
  
  // Group results by role
  const resultsByRole = {};
  
  allResults.forEach(result => {
    if (!resultsByRole[result.role]) {
      resultsByRole[result.role] = [];
    }
    resultsByRole[result.role].push(result);
    
    summary.total++;
    
    if (result.success) {
      summary.successful++;
      if (result.redirect) {
        summary.redirects++;
      }
    } else {
      summary.failed++;
      const errorType = result.error?.type || 'UNKNOWN';
      summary.errors[errorType] = (summary.errors[errorType] || 0) + 1;
    }
  });
  
  // Print role-by-role summary
  Object.keys(resultsByRole).forEach(role => {
    const roleResults = resultsByRole[role];
    const successful = roleResults.filter(r => r.success).length;
    const total = roleResults.length;
    
    if (successful === total) {
      logSuccess(`${role}: ${successful}/${total} routes working`);
    } else {
      logError(`${role}: ${successful}/${total} routes working`);
    }
  });
  
  // Print overall summary
  log('\n' + '='.repeat(50));
  log(`Total routes tested: ${summary.total}`, 'bright');
  log(`Successful: ${summary.successful}`, summary.successful === summary.total ? 'green' : 'yellow');
  log(`Failed: ${summary.failed}`, summary.failed === 0 ? 'green' : 'red');
  log(`Redirects: ${summary.redirects}`, 'blue');
  
  if (Object.keys(summary.errors).length > 0) {
    log('\nError breakdown:', 'yellow');
    Object.entries(summary.errors).forEach(([type, count]) => {
      log(`  ${type}: ${count}`, 'red');
    });
  }
  
  log('='.repeat(50));
  
  return summary;
}

// Main execution
async function main() {
  logHeader('Navigation Validation Starting');
  logInfo(`Testing against: ${BASE_URL}`);
  logInfo(`Timeout: ${TIMEOUT}ms`);
  
  // Check if server is running
  try {
    await makeRequest(BASE_URL);
    logSuccess('Server is running');
  } catch (error) {
    logError(`Server is not accessible: ${error.message}`);
    logError('Please ensure the development server is running on port 5000');
    process.exit(1);
  }
  
  const allResults = [];
  const roles = Object.keys(ROUTES_BY_ROLE);
  
  // Test each role
  for (const role of roles) {
    const roleResults = await testRole(role);
    allResults.push(...roleResults);
  }
  
  // Generate and display summary
  const summary = generateSummary(allResults);
  
  // Exit with appropriate code
  if (summary.failed === 0) {
    logSuccess('\n🎉 All navigation routes are working correctly!');
    process.exit(0);
  } else {
    logError(`\n💥 ${summary.failed} routes have issues that need attention.`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    logError(`Script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testRoute,
  testRole,
  makeRequest,
  hasRuntimeError,
  ROUTES_BY_ROLE
};