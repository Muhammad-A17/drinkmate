#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Read the inventory file
const inventoryPath = './cloudinary-assets.json';
const assets = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

// Create downloads directory
const downloadsDir = './cloudinary-downloads';
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Create subdirectories for each cloud
const clouds = [...new Set(assets.map(asset => asset.cloud))];
clouds.forEach(cloud => {
  const cloudDir = path.join(downloadsDir, cloud);
  if (!fs.existsSync(cloudDir)) {
    fs.mkdirSync(cloudDir, { recursive: true });
  }
});

// Download function
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Extract filename from URL
function getFilename(url, type) {
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  
  // Remove query parameters
  const cleanFilename = filename.split('?')[0];
  
  // Ensure proper extension based on type
  if (type === 'video' && !cleanFilename.includes('.')) {
    return cleanFilename + '.webm';
  }
  
  return cleanFilename;
}

// Main download process
async function downloadAssets() {
  console.log(`Starting download of ${assets.length} assets...`);
  
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const filename = getFilename(asset.url, asset.type);
    const filepath = path.join(downloadsDir, asset.cloud, filename);
    
    try {
      console.log(`[${i + 1}/${assets.length}] Downloading: ${filename}`);
      await downloadFile(asset.url, filepath);
      results.success++;
      console.log(`✓ Downloaded: ${filepath}`);
    } catch (error) {
      results.failed++;
      results.errors.push({
        url: asset.url,
        filename: filename,
        error: error.message
      });
      console.error(`✗ Failed: ${filename} - ${error.message}`);
    }
  }
  
  // Save results summary
  const summary = {
    total: assets.length,
    success: results.success,
    failed: results.failed,
    errors: results.errors,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(downloadsDir, 'download-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('\n=== Download Summary ===');
  console.log(`Total assets: ${summary.total}`);
  console.log(`Successfully downloaded: ${summary.success}`);
  console.log(`Failed: ${summary.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\nFailed downloads:');
    results.errors.forEach(err => {
      console.log(`- ${err.filename}: ${err.error}`);
    });
  }
  
  console.log(`\nAssets saved to: ${path.resolve(downloadsDir)}`);
  console.log(`Summary saved to: ${path.resolve(downloadsDir, 'download-summary.json')}`);
}

// Run the download
downloadAssets().catch(console.error);
