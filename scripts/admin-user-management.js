/**
 * Admin User Creation Script
 *
 * This script helps create admin users and manage user roles in the system.
 * Run this script to promote a user to admin or demote them to regular user.
 */

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateUserRole(userId, newRole) {
  console.log(`🔧 Updating user role for ${userId} to ${newRole}`);

  try {
    // Check if user exists
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error(`❌ User ${userId} does not exist in database`);
      return false;
    }

    const userData = userSnap.data();
    console.log(`👤 Current user data:`, {
      email: userData.email,
      displayName: userData.displayName,
      currentRole: userData.role || "user",
    });

    // Update user role
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ User role updated successfully to ${newRole}`);
    return true;
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    return false;
  }
}

async function listUsers() {
  console.log("📋 Listing all users...");

  try {
    const { collection, getDocs } = require("firebase/firestore");
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    console.log(`\n👥 Found ${querySnapshot.size} users:\n`);

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`🆔 ${doc.id}`);
      console.log(`📧 Email: ${userData.email}`);
      console.log(`👤 Display Name: ${userData.displayName}`);
      console.log(`🎭 Role: ${userData.role || "user"}`);
      console.log(
        `📅 Created: ${
          userData.createdAt
            ? new Date(userData.createdAt.seconds * 1000).toLocaleString()
            : "N/A"
        }`
      );
      console.log(
        `📅 Last Active: ${
          userData.lastActiveAt
            ? new Date(userData.lastActiveAt).toLocaleString()
            : "N/A"
        }`
      );
      console.log("─".repeat(50));
    });
  } catch (error) {
    console.error("❌ Error listing users:", error);
  }
}

async function getUserById(userId) {
  console.log(`🔍 Looking up user ${userId}...`);

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error(`❌ User ${userId} does not exist`);
      return null;
    }

    const userData = userSnap.data();
    console.log(`👤 User details:`, {
      id: userId,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role || "user",
      emailVerified: userData.emailVerified || false,
      totalSubmissions: userData.totalSubmissions || 0,
      createdAt: userData.createdAt
        ? new Date(userData.createdAt.seconds * 1000).toLocaleString()
        : "N/A",
      lastActiveAt: userData.lastActiveAt
        ? new Date(userData.lastActiveAt).toLocaleString()
        : "N/A",
    });

    return userData;
  } catch (error) {
    console.error("❌ Error getting user:", error);
    return null;
  }
}

async function findUserByEmail(email) {
  console.log(`🔍 Looking up user by email: ${email}...`);

  try {
    const { collection, query, where, getDocs } = require("firebase/firestore");
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error(`❌ No user found with email ${email}`);
      return null;
    }

    if (querySnapshot.size > 1) {
      console.warn(`⚠️  Multiple users found with email ${email}`);
    }

    const doc = querySnapshot.docs[0];
    const userData = doc.data();

    console.log(`👤 User found:`, {
      id: doc.id,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role || "user",
    });

    return { id: doc.id, ...userData };
  } catch (error) {
    console.error("❌ Error finding user by email:", error);
    return null;
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  const param1 = process.argv[3];
  const param2 = process.argv[4];

  console.log("🚀 Admin User Management Script");
  console.log("================================\n");

  switch (command) {
    case "list":
      await listUsers();
      break;

    case "get":
      if (!param1) {
        console.error("❌ Please provide a user ID");
        console.log(
          "Usage: node scripts/admin-user-management.js get <userId>"
        );
        return;
      }
      await getUserById(param1);
      break;

    case "find":
      if (!param1) {
        console.error("❌ Please provide an email address");
        console.log(
          "Usage: node scripts/admin-user-management.js find <email>"
        );
        return;
      }
      await findUserByEmail(param1);
      break;

    case "promote":
      if (!param1) {
        console.error("❌ Please provide a user ID or email");
        console.log(
          "Usage: node scripts/admin-user-management.js promote <userId|email>"
        );
        return;
      }

      let userToPromote;
      if (param1.includes("@")) {
        userToPromote = await findUserByEmail(param1);
        if (!userToPromote) return;
        param1 = userToPromote.id;
      }

      await updateUserRole(param1, "admin");
      break;

    case "demote":
      if (!param1) {
        console.error("❌ Please provide a user ID or email");
        console.log(
          "Usage: node scripts/admin-user-management.js demote <userId|email>"
        );
        return;
      }

      let userToDemote;
      if (param1.includes("@")) {
        userToDemote = await findUserByEmail(param1);
        if (!userToDemote) return;
        param1 = userToDemote.id;
      }

      await updateUserRole(param1, "user");
      break;

    case "role":
      if (!param1 || !param2) {
        console.error("❌ Please provide a user ID/email and role");
        console.log(
          "Usage: node scripts/admin-user-management.js role <userId|email> <admin|user>"
        );
        return;
      }

      if (!["admin", "user"].includes(param2)) {
        console.error('❌ Role must be either "admin" or "user"');
        return;
      }

      let userToUpdate;
      if (param1.includes("@")) {
        userToUpdate = await findUserByEmail(param1);
        if (!userToUpdate) return;
        param1 = userToUpdate.id;
      }

      await updateUserRole(param1, param2);
      break;

    default:
      console.log("Available commands:");
      console.log("  list                           - List all users");
      console.log("  get <userId>                   - Get user by ID");
      console.log("  find <email>                   - Find user by email");
      console.log("  promote <userId|email>         - Promote user to admin");
      console.log(
        "  demote <userId|email>          - Demote user to regular user"
      );
      console.log(
        "  role <userId|email> <role>     - Set user role (admin|user)"
      );
      console.log("");
      console.log("Examples:");
      console.log("  node scripts/admin-user-management.js list");
      console.log(
        "  node scripts/admin-user-management.js find admin@example.com"
      );
      console.log(
        "  node scripts/admin-user-management.js promote admin@example.com"
      );
      console.log("  node scripts/admin-user-management.js role user123 admin");
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateUserRole, listUsers, getUserById, findUserByEmail };
