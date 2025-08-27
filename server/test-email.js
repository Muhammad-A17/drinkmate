#!/usr/bin/env node

/**
 * Email Test Script for Drinkmate
 * 
 * This script tests the email functionality without starting the full server.
 * Run this to verify your email configuration is working.
 * 
 * Usage: node test-email.js
 */

require('dotenv').config();
const { sendPasswordResetEmail, sendWelcomeEmail, testEmailConnection } = require('./Utils/email-service');

async function testEmailSetup() {
  console.log('🧪 Testing Email Setup for Drinkmate\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || '❌ Not set'}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '❌ Not set'}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER || '❌ Not set'}`);
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Set' : '❌ Not set'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`);
  
  // Test email connection
  console.log('🔌 Testing SMTP Connection...');
  try {
    const connectionResult = await testEmailConnection();
    if (connectionResult.success) {
      console.log('✅ SMTP connection successful!\n');
    } else {
      console.log('❌ SMTP connection failed:', connectionResult.error);
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Check your SMTP credentials');
      console.log('   2. Verify 2FA is enabled and app password is generated');
      console.log('   3. Check firewall/network settings');
      console.log('   4. Try different SMTP ports (587, 465, 25)\n');
      return;
    }
  } catch (error) {
    console.log('❌ Error testing connection:', error.message);
    return;
  }
  
    // Test sending password reset email
  console.log('📧 Testing Password Reset Email...');
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testResetUrl = 'https://drinkmate.sa/reset-password/test-token';

  try {
    const emailResult = await sendPasswordResetEmail(
      testEmail,
      testResetUrl,
      'Test User'
    );

    if (emailResult.success) {
      console.log('✅ Password reset email sent successfully!');
      console.log(`   Message ID: ${emailResult.messageId}`);
      console.log(`   Sent to: ${testEmail}`);
    } else {
      console.log('❌ Failed to send password reset email:', emailResult.error);
    }
  } catch (error) {
    console.log('❌ Error sending password reset email:', error.message);
  }

  // Test sending welcome email
  console.log('\n📧 Testing Welcome Email...');
  try {
    const welcomeResult = await sendWelcomeEmail(
      testEmail,
      'Test User'
    );

    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully!');
      console.log(`   Message ID: ${welcomeResult.messageId}`);
      console.log(`   Sent to: ${testEmail}`);
    } else {
      console.log('❌ Failed to send welcome email:', welcomeResult.error);
    }
  } catch (error) {
    console.log('❌ Error sending welcome email:', error.message);
  }

  console.log('\n📬 Check your email inbox (and spam folder) for both test emails.');
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Check your email for the test message');
  console.log('   2. If successful, test the full password reset flow');
  console.log('   3. If failed, check the troubleshooting guide');
  console.log('   4. Update your .env file with correct credentials');
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Email Test Script for Drinkmate

Usage: node test-email.js [options]

Options:
  --help, -h     Show this help message
  --env          Show current environment variables
  --test-email   Test with specific email address

Examples:
  node test-email.js
  node test-email.js --env
  TEST_EMAIL=your@email.com node test-email.js

Environment Variables:
  SMTP_HOST      SMTP server hostname
  SMTP_PORT      SMTP server port
  SMTP_USER      SMTP username/email
  SMTP_PASS      SMTP password/app password
  TEST_EMAIL     Email address for testing (optional)
  `);
  process.exit(0);
}

if (args.includes('--env')) {
  console.log('📋 Current Environment Variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '[SET]' : '[NOT SET]');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  process.exit(0);
}

// Run the test
testEmailSetup().catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
