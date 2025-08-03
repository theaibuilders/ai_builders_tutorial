#!/usr/bin/env node

/**
 * Tutorial Metadata Manager
 * 
 * This script helps you manage author names and last updated dates for tutorials.
 * 
 * Usage:
 *   node manage-metadata.js list                           # List all tutorials
 *   node manage-metadata.js set <path> <author> <date>     # Set metadata for a tutorial
 *   node manage-metadata.js get <path>                     # Get metadata for a tutorial
 * 
 * Examples:
 *   node manage-metadata.js set "Frameworks/langchain.ipynb" "John Doe" "2025-01-15"
 *   node manage-metadata.js get "Frameworks/langchain.ipynb"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METADATA_FILE = path.join(__dirname, 'tutorial-metadata.json');
const TUTORIALS_DIR = path.join(__dirname, 'tutorials');

function loadMetadata() {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading metadata:', error);
  }
  
  return {
    tutorials: {},
    _instructions: {
      description: "This file allows you to manually override author and lastUpdated metadata for tutorials.",
      usage: "Add entries using the tutorial path (relative to tutorials directory) as the key.",
      example: {
        "SectionName/tutorial_file.ipynb": {
          "author": "Your Name",
          "lastUpdated": "2025-01-01"
        }
      }
    }
  };
}

function saveMetadata(metadata) {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
    console.log('✅ Metadata saved successfully!');
  } catch (error) {
    console.error('❌ Error saving metadata:', error);
  }
}

function getAllTutorials() {
  const tutorials = [];
  
  function scanDirectory(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, prefix + item + '/');
      } else if (item.endsWith('.md') || item.endsWith('.ipynb')) {
        tutorials.push(prefix + item);
      }
    }
  }
  
  if (fs.existsSync(TUTORIALS_DIR)) {
    scanDirectory(TUTORIALS_DIR);
  }
  
  return tutorials;
}

function autoUpdateMetadata() {
  const metadata = loadMetadata();
  const allTutorials = getAllTutorials();
  let updated = false;
  
  console.log('🔍 Scanning for new tutorials...');
  
  for (const tutorial of allTutorials) {
    if (!metadata.tutorials[tutorial]) {
      console.log(`📝 Found new tutorial: ${tutorial}`);
      metadata.tutorials[tutorial] = {
        authorId: "devon-sun",
        lastUpdated: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      };
      updated = true;
    }
  }
  
  // Remove entries for tutorials that no longer exist
  const existingPaths = Object.keys(metadata.tutorials);
  for (const existingPath of existingPaths) {
    if (!allTutorials.includes(existingPath)) {
      console.log(`🗑️  Removing deleted tutorial: ${existingPath}`);
      delete metadata.tutorials[existingPath];
      updated = true;
    }
  }
  
  if (updated) {
    saveMetadata(metadata);
    console.log('✅ Metadata file updated with new tutorials!');
  } else {
    console.log('✅ Metadata file is up to date!');
  }
  
  return updated;
}

function listTutorials() {
  const metadata = loadMetadata();
  const allTutorials = getAllTutorials();
  
  console.log('📚 Available Tutorials:');
  console.log('=======================\n');
  
  allTutorials.forEach(tutorial => {
    const override = metadata.tutorials[tutorial];
    const status = override ? '✏️  (custom metadata)' : '📄 (default metadata)';
    
    console.log(`${status} ${tutorial}`);
    if (override) {
      console.log(`   Author: ${override.author || 'Not set'}`);
      console.log(`   Last Updated: ${override.lastUpdated || 'Not set'}`);
    }
    console.log('');
  });
}

function setMetadata(tutorialPath, author, lastUpdated) {
  const metadata = loadMetadata();
  
  if (!metadata.tutorials[tutorialPath]) {
    metadata.tutorials[tutorialPath] = {};
  }
  
  if (author) {
    metadata.tutorials[tutorialPath].author = author;
  }
  
  if (lastUpdated) {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(lastUpdated)) {
      console.error('❌ Invalid date format. Please use YYYY-MM-DD format.');
      return;
    }
    metadata.tutorials[tutorialPath].lastUpdated = lastUpdated;
  }
  
  saveMetadata(metadata);
  console.log(`✅ Updated metadata for: ${tutorialPath}`);
  console.log(`   Author: ${metadata.tutorials[tutorialPath].author}`);
  console.log(`   Last Updated: ${metadata.tutorials[tutorialPath].lastUpdated}`);
}

function getMetadata(tutorialPath) {
  const metadata = loadMetadata();
  const tutorialData = metadata.tutorials[tutorialPath];
  
  console.log(`📄 Metadata for: ${tutorialPath}`);
  console.log('=====================================');
  
  if (tutorialData) {
    console.log(`Author: ${tutorialData.author || 'Not set'}`);
    console.log(`Last Updated: ${tutorialData.lastUpdated || 'Not set'}`);
    console.log('Status: Custom metadata');
  } else {
    console.log('Author: AI Builders Team (default)');
    console.log('Last Updated: 2025-01-01 (default)');
    console.log('Status: Using default metadata');
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'list':
    listTutorials();
    break;
    
  case 'set':
    if (args.length < 4) {
      console.error('Usage: node manage-metadata.js set <path> <author> <date>');
      console.error('Example: node manage-metadata.js set "Frameworks/langchain.ipynb" "John Doe" "2025-01-15"');
      process.exit(1);
    }
    setMetadata(args[1], args[2], args[3]);
    break;
    
  case 'get':
    if (args.length < 2) {
      console.error('Usage: node manage-metadata.js get <path>');
      console.error('Example: node manage-metadata.js get "Frameworks/langchain.ipynb"');
      process.exit(1);
    }
    getMetadata(args[1]);
    break;
    
  case 'auto-update':
    autoUpdateMetadata();
    break;
    
  default:
    console.log('📚 Tutorial Metadata Manager');
    console.log('============================\n');
    console.log('Available commands:');
    console.log('  list                           - List all tutorials and their metadata status');
    console.log('  set <path> <author> <date>     - Set custom metadata for a tutorial');
    console.log('  get <path>                     - Get metadata for a specific tutorial');
    console.log('  auto-update                    - Automatically add new tutorials to metadata');
    console.log('\nExamples:');
    console.log('  node manage-metadata.js list');
    console.log('  node manage-metadata.js set "Frameworks/langchain.ipynb" "John Doe" "2025-01-15"');
    console.log('  node manage-metadata.js get "Frameworks/langchain.ipynb"');
    console.log('  node manage-metadata.js auto-update');
    console.log('\nNote: Date format should be YYYY-MM-DD');
    break;
}
