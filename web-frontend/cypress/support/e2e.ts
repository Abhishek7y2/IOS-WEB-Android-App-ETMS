// ***********************************************************
// Cypress Support Configuration
// ***********************************************************

import './commands';

// Catch uncaught exceptions gracefully if they are non-critical Next.js runtime hydration warnings
Cypress.on('uncaught:exception', (err, runnable) => {
  if (
    err.message.includes('NEXT_REDIRECT') ||
    err.message.includes('Hydration') ||
    err.message.includes('Minified React error')
  ) {
    return false;
  }
  // Let actual fatal code exceptions fail the test
  return true;
});
