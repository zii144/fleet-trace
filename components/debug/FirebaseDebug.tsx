"use client";

import { useEffect, useState } from "react";
import { testFirebaseConnection } from "@/lib/firebase";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function FirebaseDebug() {
  const [connectionStatus, setConnectionStatus] = useState<
    "testing" | "success" | "failed"
  >("testing");
  const [configStatus, setConfigStatus] = useState<any>({});

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    console.log("🔍 Starting Firebase debug check...");

    // Check environment variables
    const envConfig = {
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      hasMessagingSenderId:
        !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    };

    console.log("🔧 Environment config:", envConfig);
    setConfigStatus(envConfig);

    // Test Firebase connection
    try {
      const isConnected = await testFirebaseConnection();
      setConnectionStatus(isConnected ? "success" : "failed");
    } catch (error) {
      console.error("🔥 Firebase connection error:", error);
      setConnectionStatus("failed");
    }
  };

  const testAuth = async () => {
    console.log("🔐 Testing Firebase Auth manually...");
    try {
      console.log("Auth object:", auth);
      console.log("Auth app:", auth.app);
      console.log("Auth config:", auth.config);
      console.log("Current user:", auth.currentUser);
    } catch (error) {
      console.error("Auth test error:", error);
    }
  };

  const testFirestore = async () => {
    console.log("🗃️ Testing Firestore manually...");
    try {
      console.log("Firestore object:", db);
      console.log("Firestore app:", db.app);

      // Try to access a collection
      const { collection } = await import("firebase/firestore");
      const testCol = collection(db, "test");
      console.log("Test collection:", testCol);
    } catch (error) {
      console.error("Firestore test error:", error);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">🔧 Firebase Debug Info</CardTitle>
        <CardDescription className="text-xs">
          Development debugging panel
        </CardDescription>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Connection Status:</strong>{" "}
          <span
            className={
              connectionStatus === "success"
                ? "text-green-600"
                : connectionStatus === "failed"
                ? "text-red-600"
                : "text-yellow-600"
            }
          >
            {connectionStatus}
          </span>
        </div>

        <div>
          <strong>Environment Variables:</strong>
          <ul className="ml-4 mt-1">
            <li>API Key: {configStatus.hasApiKey ? "✅" : "❌"}</li>
            <li>
              Auth Domain: {configStatus.hasAuthDomain ? "✅" : "❌"} (
              {configStatus.authDomain})
            </li>
            <li>
              Project ID: {configStatus.hasProjectId ? "✅" : "❌"} (
              {configStatus.projectId})
            </li>
            <li>
              Storage Bucket: {configStatus.hasStorageBucket ? "✅" : "❌"}
            </li>
            <li>
              Messaging Sender ID:{" "}
              {configStatus.hasMessagingSenderId ? "✅" : "❌"}
            </li>
            <li>App ID: {configStatus.hasAppId ? "✅" : "❌"}</li>
          </ul>
        </div>

        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={checkFirebaseStatus}>
            Recheck
          </Button>
          <Button size="sm" variant="outline" onClick={testAuth}>
            Test Auth
          </Button>
          <Button size="sm" variant="outline" onClick={testFirestore}>
            Test Firestore
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Check browser console for detailed logs
        </div>
      </CardContent>
    </Card>
  );
}
