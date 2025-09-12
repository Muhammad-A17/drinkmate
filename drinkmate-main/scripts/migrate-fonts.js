#!/usr/bin/env node

/**
 * Font Migration Script
 * 
 * This script helps migrate font classes to use the new semantic system:
 * - font-cairo -> font-primary (for Arabic)
 * - font-montserrat -> font-primary (for English)
 * - font-noto-arabic -> font-secondary (for Arabic)
 * - font-noto-sans -> font-secondary (for English)
 * 
 * Usage: node scripts/migrate-fonts.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// File patterns to search
const patterns = [
  'app/**/*.{js,jsx,ts,tsx}',
  'components/**/*.{js,jsx,ts,tsx}',
  'lib/**/*.{js,jsx,ts,tsx}',
];

// Font class mappings
const fontMappings = {
  // Primary fonts
  'font-cairo': 'font-primary',
  'font-montserrat': 'font-primary',
  
  // Secondary fonts
  'font-noto-arabic': 'font-secondary',
  'font-noto-sans': 'font-secondary',
  
  // Remove old font classes that are now handled by CSS
  'font-geist': '', // Remove as it's not part of the new system
};

// Find all files matching patterns
function findFiles() {
  const files = [];
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, { cwd: process.cwd() });
    files.push(...matches);
  });
  return [...new Set(files)]; // Remove duplicates
}

// Process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Apply font mappings
    Object.entries(fontMappings).forEach(([oldClass, newClass]) => {
      const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
      if (regex.test(newContent)) {
        if (newClass) {
          newContent = newContent.replace(regex, newClass);
        } else {
          // Remove the class entirely
          newContent = newContent.replace(regex, '');
        }
        modified = true;
      }
    });
    
    // Clean up extra spaces that might be left after removing classes
    newContent = newContent.replace(/\s+/g, ' ').trim();
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🚀 Starting font migration...\n');
  
  const files = findFiles();
  console.log(`Found ${files.length} files to process\n`);
  
  let processedCount = 0;
  let modifiedCount = 0;
  
  files.forEach(file => {
    processedCount++;
    if (processFile(file)) {
      modifiedCount++;
    }
  });
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`   Files processed: ${processedCount}`);
  console.log(`   Files modified: ${modifiedCount}`);
  console.log(`   Files unchanged: ${processedCount - modifiedCount}`);
  
  if (modifiedCount > 0) {
    console.log(`\n✨ Migration completed! Please review the changes and test your application.`);
  } else {
    console.log(`\n✨ No files needed migration. Your font system is already up to date!`);
  }
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { processFile, fontMappings };
