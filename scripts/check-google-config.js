#!/usr/bin/env node
/* eslint-env node */

/**
 * Quick diagnostic script to verify Google OAuth configuration
 * Run with: node scripts/check-google-config.js
 */

require('dotenv/config');

const chalk = require('chalk');

console.log('\n' + chalk.bold.blue('🔍 FocusPlan Google OAuth Configuration Check\n'));

const checks = [];

// Check 1: Environment variables
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_WEB_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.GOOGLE_ANDROID_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.GOOGLE_IOS_CLIENT_ID;

checks.push({
  name: 'Web Client ID',
  status: !!webClientId,
  value: webClientId ? `${webClientId.substring(0, 30)}...` : 'Not set',
  required: true
});

checks.push({
  name: 'Android Client ID',
  status: !!androidClientId,
  value: androidClientId ? `${androidClientId.substring(0, 30)}...` : 'Not set (optional)',
  required: false
});

checks.push({
  name: 'iOS Client ID',
  status: !!iosClientId,
  value: iosClientId ? `${iosClientId.substring(0, 30)}...` : 'Not set (optional)',
  required: false
});

// Check 2: Client ID format
if (webClientId) {
  const validFormat = webClientId.endsWith('.apps.googleusercontent.com');
  checks.push({
    name: 'Client ID Format',
    status: validFormat,
    value: validFormat ? 'Valid' : 'Invalid - should end with .apps.googleusercontent.com',
    required: true
  });
}

// Check 3: API endpoint configuration
const websiteUrl = process.env.WEBSITE_URL || process.env.WEBSITE_URL_PROD || process.env.WEBSITE_URL_LOCAL || 'http://localhost:8081';
checks.push({
  name: 'API Endpoint URL',
  status: true,
  value: websiteUrl,
  required: true
});

// Display results
console.log(chalk.bold('Configuration Status:\n'));

checks.forEach(check => {
  const icon = check.status ? chalk.green('✓') : (check.required ? chalk.red('✗') : chalk.yellow('⚠'));
  const status = check.status ? chalk.green('OK') : (check.required ? chalk.red('MISSING') : chalk.yellow('OPTIONAL'));
  console.log(`${icon} ${chalk.bold(check.name)}: ${status}`);
  console.log(`  ${chalk.gray(check.value)}\n`);
});

// Summary
const requiredChecks = checks.filter(c => c.required);
const passedRequired = requiredChecks.filter(c => c.status).length;
const allPassed = passedRequired === requiredChecks.length;

console.log(chalk.bold('\n' + '='.repeat(60)));
if (allPassed) {
  console.log(chalk.green.bold('\n✓ All required configuration is present!\n'));
  console.log(chalk.white('Next steps:'));
  console.log(chalk.white('1. Ensure Google Calendar API is enabled in Google Cloud Console'));
  console.log(chalk.white('2. Add authorized redirect URIs in Google Console'));
  console.log(chalk.white('3. Run: npm start\n'));
} else {
  console.log(chalk.red.bold('\n✗ Configuration incomplete!\n'));
  console.log(chalk.white('Please fix the issues above before running the app.'));
  console.log(chalk.white('See GOOGLE_CALENDAR_SETUP.md for detailed instructions.\n'));
  process.exit(1);
}

// Additional tips
console.log(chalk.bold.cyan('Quick Tips:\n'));
console.log(chalk.white('• Client IDs must have EXPO_PUBLIC_ prefix in .env for Expo'));
console.log(chalk.white('• Restart dev server after changing .env file'));
console.log(chalk.white('• Check browser/app console for detailed authentication logs'));
console.log(chalk.white('• Use GoogleAuthDebug component for runtime diagnostics\n'));
