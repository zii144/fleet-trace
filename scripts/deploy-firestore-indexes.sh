#!/bin/bash

# Deploy Firestore Indexes Script
echo "🚀 Deploying Firestore Indexes..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔑 Checking Firebase authentication..."
firebase login --non-interactive || firebase login

# Deploy indexes
echo "📄 Deploying firestore indexes..."
firebase deploy --only firestore:indexes --project velo-trace

echo "✅ Firestore indexes deployed successfully!"
echo "⏳ Note: Indexes may take a few minutes to build in the Firebase console"
echo "🌐 Check status at: https://console.firebase.google.com/project/velo-trace/firestore/indexes"
