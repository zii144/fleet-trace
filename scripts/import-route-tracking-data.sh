#!/bin/bash

echo "🚀 Importing Route Completion Tracking Data to Firestore..."

# Check if the JSON file exists
if [ ! -f "route-completion-tracking-data.json" ]; then
    echo "❌ Error: route-completion-tracking-data.json not found!"
    echo "Please make sure the JSON file exists in the current directory."
    exit 1
fi

echo "📋 Found route-completion-tracking-data.json"

# Check if Firebase CLI is installed and logged in
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI is installed"

# Check if we're logged in
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

echo "✅ Logged in to Firebase"

# Import the data using Firebase CLI
echo "📤 Importing data to Firestore..."
firebase firestore:import --data-file=route-completion-tracking-data.json --project=velo-trace

if [ $? -eq 0 ]; then
    echo "✅ Successfully imported route completion tracking data!"
    echo "📊 Total records imported: 87 (29 routes × 3 questionnaires)"
    echo "🌐 Check your Firestore console to verify the data"
else
    echo "❌ Failed to import data. Please check the error messages above."
    exit 1
fi

echo "🎉 Route completion tracking data import complete!"
