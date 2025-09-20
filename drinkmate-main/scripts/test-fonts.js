#!/usr/bin/env node

/**
 * Font Testing Script
 * This script tests if fonts are loading correctly
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const fonts = [
  'Montserrat',
  'Cairo', 
  'Noto Sans',
  'Noto Sans Arabic'
];

const weights = {
  'Montserrat': ['400', '500', '600', '700'],
  'Cairo': ['400', '500', '600', '700'],
  'Noto Sans': ['400', '600'],
  'Noto Sans Arabic': ['400', '600']
};

async function testFont(fontName) {
  const weightsList = weights[fontName].join(';');
  const url = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@${weightsList}&display=swap`;
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200 && data.includes('@font-face')) {
          console.log(`✅ ${fontName}: Font loaded successfully`);
          resolve(true);
        } else {
          console.log(`❌ ${fontName}: Font failed to load (Status: ${res.statusCode})`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ ${fontName}: Network error - ${err.message}`);
      resolve(false);
    });
  });
}

async function testAllFonts() {
  console.log('🔍 Testing font loading...\n');
  
  const results = await Promise.all(fonts.map(testFont));
  const successCount = results.filter(Boolean).length;
  
  console.log(`\n📊 Results: ${successCount}/${fonts.length} fonts loaded successfully`);
  
  if (successCount === fonts.length) {
    console.log('🎉 All fonts are working correctly!');
  } else {
    console.log('⚠️  Some fonts failed to load. Check your internet connection and Google Fonts access.');
  }
}

// Run the test
testAllFonts().catch(console.error);
