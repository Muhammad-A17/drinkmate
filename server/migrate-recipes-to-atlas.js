#!/usr/bin/env node

/**
 * Recipe Migration Script
 * 
 * This script safely migrates recipes from local MongoDB to MongoDB Atlas
 * while preserving existing Atlas data and avoiding duplicates.
 * 
 * Usage: node migrate-recipes-to-atlas.js
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

// Import the Recipe model
const Recipe = require('./Models/recipe-model');

// Database configurations
const LOCAL_DB_URI = 'mongodb://localhost:27017/drinkmate';
const ATLAS_DB_URI = process.env.MONGODB_URI || 'mongodb+srv://test1234:IhpDHsYWshrvtLQc@cluster0.y205sfi.mongodb.net/drinkmate?retryWrites=true&w=majority&appName=Cluster0';

// Connection options
const connectionOptions = {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    maxPoolSize: 10,
    heartbeatFrequencyMS: 10000,
};

let localConnection, atlasConnection;

async function connectToDatabases() {
    try {
        console.log('🔌 Connecting to local MongoDB...');
        localConnection = await mongoose.createConnection(LOCAL_DB_URI, connectionOptions);
        console.log('✅ Connected to local MongoDB');

        console.log('🔌 Connecting to MongoDB Atlas...');
        atlasConnection = await mongoose.createConnection(ATLAS_DB_URI, connectionOptions);
        console.log('✅ Connected to MongoDB Atlas');

        return { localConnection, atlasConnection };
    } catch (error) {
        console.error('❌ Error connecting to databases:', error);
        throw error;
    }
}

async function getLocalRecipes() {
    try {
        const LocalRecipe = localConnection.model('Recipe', Recipe.schema);
        const recipes = await LocalRecipe.find({}).lean();
        console.log(`📊 Found ${recipes.length} recipes in local database`);
        return recipes;
    } catch (error) {
        console.error('❌ Error fetching local recipes:', error);
        throw error;
    }
}

async function getAtlasRecipes() {
    try {
        const AtlasRecipe = atlasConnection.model('Recipe', Recipe.schema);
        const recipes = await AtlasRecipe.find({}).lean();
        console.log(`📊 Found ${recipes.length} recipes in Atlas database`);
        return recipes;
    } catch (error) {
        console.error('❌ Error fetching Atlas recipes:', error);
        throw error;
    }
}

async function createBackup() {
    try {
        console.log('💾 Creating backup of Atlas recipes...');
        const AtlasRecipe = atlasConnection.model('Recipe', Recipe.schema);
        const recipes = await AtlasRecipe.find({}).lean();
        
        const backupData = {
            timestamp: new Date().toISOString(),
            count: recipes.length,
            recipes: recipes
        };
        
        const fs = require('fs');
        const backupFile = `atlas-backup-${Date.now()}.json`;
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        console.log(`✅ Backup created: ${backupFile}`);
        return backupFile;
    } catch (error) {
        console.error('❌ Error creating backup:', error);
        throw error;
    }
}

function findDuplicates(localRecipes, atlasRecipes) {
    const duplicates = [];
    const atlasTitles = new Set(atlasRecipes.map(r => r.title.toLowerCase().trim()));
    
    localRecipes.forEach(localRecipe => {
        if (atlasTitles.has(localRecipe.title.toLowerCase().trim())) {
            duplicates.push({
                local: localRecipe,
                atlas: atlasRecipes.find(r => r.title.toLowerCase().trim() === localRecipe.title.toLowerCase().trim())
            });
        }
    });
    
    return duplicates;
}

async function migrateRecipes() {
    try {
        console.log('🚀 Starting recipe migration...');
        
        // Connect to both databases
        await connectToDatabases();
        
        // Get recipes from both databases
        const localRecipes = await getLocalRecipes();
        const atlasRecipes = await getAtlasRecipes();
        
        // Create backup
        const backupFile = await createBackup();
        
        // Find duplicates
        const duplicates = findDuplicates(localRecipes, atlasRecipes);
        console.log(`🔍 Found ${duplicates.length} potential duplicates`);
        
        if (duplicates.length > 0) {
            console.log('⚠️  Duplicate recipes found:');
            duplicates.forEach((dup, index) => {
                console.log(`   ${index + 1}. "${dup.local.title}"`);
                console.log(`      Local ID: ${dup.local._id}`);
                console.log(`      Atlas ID: ${dup.atlas._id}`);
                console.log(`      Local Created: ${dup.local.createdAt}`);
                console.log(`      Atlas Created: ${dup.atlas.createdAt}`);
            });
        }
        
        // Filter out duplicates from local recipes (keep Atlas versions)
        const recipesToMigrate = localRecipes.filter(localRecipe => {
            return !atlasRecipes.some(atlasRecipe => 
                atlasRecipe.title.toLowerCase().trim() === localRecipe.title.toLowerCase().trim()
            );
        });
        
        console.log(`📝 Will migrate ${recipesToMigrate.length} new recipes to Atlas`);
        
        if (recipesToMigrate.length === 0) {
            console.log('✅ No new recipes to migrate. All local recipes already exist in Atlas.');
            return;
        }
        
        // Migrate recipes
        const AtlasRecipe = atlasConnection.model('Recipe', Recipe.schema);
        let migratedCount = 0;
        let errorCount = 0;
        
        for (const recipe of recipesToMigrate) {
            try {
                // Remove the _id to let MongoDB generate a new one
                const { _id, ...recipeData } = recipe;
                
                // Create new recipe in Atlas
                const newRecipe = new AtlasRecipe(recipeData);
                await newRecipe.save();
                
                console.log(`✅ Migrated: "${recipe.title}"`);
                migratedCount++;
            } catch (error) {
                console.error(`❌ Error migrating "${recipe.title}":`, error.message);
                errorCount++;
            }
        }
        
        console.log('\n📊 Migration Summary:');
        console.log(`   ✅ Successfully migrated: ${migratedCount} recipes`);
        console.log(`   ❌ Errors: ${errorCount} recipes`);
        console.log(`   📁 Backup file: ${backupFile}`);
        console.log(`   🔒 Preserved: ${atlasRecipes.length} existing Atlas recipes`);
        
        // Verify final count
        const finalAtlasCount = await AtlasRecipe.countDocuments();
        console.log(`   📈 Final Atlas recipe count: ${finalAtlasCount}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        // Close connections
        if (localConnection) {
            await localConnection.close();
            console.log('🔌 Closed local database connection');
        }
        if (atlasConnection) {
            await atlasConnection.close();
            console.log('🔌 Closed Atlas database connection');
        }
    }
}

// Run migration
if (require.main === module) {
    migrateRecipes()
        .then(() => {
            console.log('🎉 Migration completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateRecipes };
