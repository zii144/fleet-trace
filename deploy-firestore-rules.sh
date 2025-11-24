#!/bin/bash

# Deploy Firestore Security Rules
# This script deploys the updated firestore.rules to your Firebase project

echo "🔒 Deploying Firestore Security Rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Deploy the rules
echo "📤 Deploying firestore.rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore security rules deployed successfully!"
    echo ""
    echo "🔐 New admin permissions:"
    echo "  - Admins can read/write all users"
    echo "  - Admins can read/write all user_stats"
    echo "  - Admins can read/write all questionnaire_responses"
    echo "  - Admins can manage all questionnaires"
    echo ""
    echo "🛡️  Security maintained:"
    echo "  - Regular users can only access their own data"
    echo "  - Admin role is verified from Firestore"
else
    echo "❌ Failed to deploy Firestore security rules"
    exit 1
fi
