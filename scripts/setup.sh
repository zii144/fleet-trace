#!/bin/bash

# Questionnaire Management Setup Script
# This script sets up the development environment for questionnaire management

set -e

echo "🚀 Setting up Questionnaire Management System..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the project root directory"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v npm &> /dev/null; then
    npm install
else
    echo "❌ Error: Neither npm nor pnpm found. Please install Node.js first."
    exit 1
fi

# Step 2: Setup Firebase Functions
echo "🔥 Setting up Firebase Functions..."
cd functions
if command -v pnpm &> /dev/null; then
    pnpm install
else
    npm install
fi
cd ..

# Step 3: Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual Firebase project details:"
    echo "   - SYNC_CLOUD_FUNCTION_URL"
    echo "   - SYNC_SECRET_KEY"
    echo ""
fi

# Step 4: Validate KML files
echo "🔍 Validating KML files..."
npm run validate:kml

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Update .env.local with your Firebase project details"
echo "2. Deploy the cloud function: firebase deploy --only functions:syncQuestionnaires"
echo "3. Run 'npm run sync:questionnaires' to sync data to Firebase"
echo "4. Start development: npm run dev"
echo ""
echo "📖 For detailed instructions, see: docs/QUESTIONNAIRE_MANAGEMENT_GUIDE.md"
