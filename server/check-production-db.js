#!/usr/bin/env node

/**
 * Check Production Database Script
 * 
 * This script checks which database the production server is actually using
 * and compares it with our local and Atlas databases.
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

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

async function checkDatabase(uri, name) {
    try {
        console.log(`🔌 Checking ${name}...`);
        const connection = await mongoose.createConnection(uri, connectionOptions);
        const Recipe = connection.model('Recipe', require('./Models/recipe-model').schema);
        
        const count = await Recipe.countDocuments();
        const recentRecipes = await Recipe.find().sort({ createdAt: -1 }).limit(3).select('title createdAt');
        
        console.log(`✅ ${name}:`);
        console.log(`   📊 Total recipes: ${count}`);
        console.log(`   📅 Recent recipes:`);
        recentRecipes.forEach((recipe, index) => {
            console.log(`      ${index + 1}. "${recipe.title}" (${recipe.createdAt})`);
        });
        
        await connection.close();
        return { count, recentRecipes };
    } catch (error) {
        console.error(`❌ Error checking ${name}:`, error.message);
        return null;
    }
}

async function checkProductionAPI() {
    try {
        console.log('🌐 Checking production API...');
        const response = await fetch('https://drinkmates.onrender.com/recipes');
        const data = await response.json();
        
        if (data.success && data.recipes) {
            console.log(`✅ Production API:`);
            console.log(`   📊 Total recipes: ${data.recipes.length}`);
            console.log(`   📅 Recent recipes:`);
            data.recipes.slice(0, 3).forEach((recipe, index) => {
                console.log(`      ${index + 1}. "${recipe.title}" (${recipe.createdAt})`);
            });
            return data.recipes.length;
        } else {
            console.log('❌ Production API returned error:', data);
            return 0;
        }
    } catch (error) {
        console.error('❌ Error checking production API:', error.message);
        return 0;
    }
}

async function main() {
    console.log('🔍 Database Comparison Analysis\n');
    
    // Check local database
    const localData = await checkDatabase(LOCAL_DB_URI, 'Local MongoDB');
    console.log('');
    
    // Check Atlas database
    const atlasData = await checkDatabase(ATLAS_DB_URI, 'MongoDB Atlas');
    console.log('');
    
    // Check production API
    const productionCount = await checkProductionAPI();
    console.log('');
    
    // Analysis
    console.log('📊 ANALYSIS:');
    console.log(`   Local MongoDB: ${localData?.count || 0} recipes`);
    console.log(`   MongoDB Atlas: ${atlasData?.count || 0} recipes`);
    console.log(`   Production API: ${productionCount} recipes`);
    console.log('');
    
    if (localData?.count === atlasData?.count) {
        console.log('✅ Local and Atlas databases are in sync');
    } else {
        console.log('⚠️  Local and Atlas databases are out of sync');
    }
    
    if (atlasData?.count === productionCount) {
        console.log('✅ Atlas database matches production API');
    } else {
        console.log('⚠️  Atlas database does NOT match production API');
        console.log('   This means the production server is using a different database!');
    }
    
    if (localData?.count === productionCount) {
        console.log('✅ Local database matches production API');
    } else {
        console.log('⚠️  Local database does NOT match production API');
    }
}

// Run the check
main()
    .then(() => {
        console.log('\n🎉 Database check completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Database check failed:', error);
        process.exit(1);
    });
