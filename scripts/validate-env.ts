#!/usr/bin/env node

/**
 * Environment Configuration Validator
 * Bu script tüm environment değişkenlerini kontrol eder ve eksik olanları listeler
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET'
];

// Optional environment variables with their defaults
const optionalEnvVars = {
  'NODE_ENV': 'development',
  'PORT': '1506',
  'JWT_EXPIRE_SECONDS': '31536000',
  'CORS_ORIGIN_PRODUCTION': 'https://yourdomain.com',
  'CORS_ORIGIN_PRODUCTION_1': 'https://yourdomain.com.tr',
  'CORS_ORIGIN_DEV_1': 'http://localhost:1506',
  'CORS_ORIGIN_DEV_2': 'http://localhost:1506',
  'UPLOAD_PATH': './uploads',
  'MAX_FILE_SIZE_MB': '5',
  'REQUEST_BODY_LIMIT': '10mb',
  'RATE_LIMIT_WINDOW_MS': '900000',
  'RATE_LIMIT_MAX_REQUESTS': '100',
  'AUTH_RATE_LIMIT_MAX_REQUESTS': '5',
  'HELMET_CSP_DEFAULT_SRC': 'self',
  'HELMET_CSP_STYLE_SRC': 'self unsafe-inline',
  'HELMET_CSP_SCRIPT_SRC': 'self',
  'HELMET_CSP_IMG_SRC': 'self data: https:'
};

console.log('🔍 Environment Configuration Validator');
console.log('=====================================\n');

let hasErrors = false;

// Check required environment variables
console.log('📋 Required Environment Variables:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: MISSING (Required)`);
    hasErrors = true;
  } else {
    console.log(`✅ ${envVar}: ${value.length > 50 ? value.substring(0, 50) + '...' : value}`);
  }
});

console.log('\n📋 Optional Environment Variables:');
Object.entries(optionalEnvVars).forEach(([envVar, defaultValue]) => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`⚠️  ${envVar}: Using default (${defaultValue})`);
  } else {
    console.log(`✅ ${envVar}: ${value}`);
  }
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ Configuration has errors! Please set the missing required variables.');
  console.log('💡 Copy .env.example to .env and fill in the required values.');
  process.exit(1);
} else {
  console.log('✅ All environment variables are properly configured!');
  console.log('🚀 Your application is ready to run.');
}