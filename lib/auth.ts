import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

import { fetchAPI } from "@/lib/fetch";

// Token cache for storing and retrieving tokens securely
export const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`Token retrieved for key: ${key} 🔐`);
      } else {
        console.log(`No token found under key: ${key}`);
      }
      return item;
    } catch (error) {
      console.error("Error retrieving token from SecureStore:", error);
      await SecureStore.deleteItemAsync(key); // Clear corrupted data
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
      console.log(`Token saved under key: ${key}`);
    } catch (error) {
      console.error("Error saving token to SecureStore:", error);
    }
  },
};

// Google OAuth flow handler
export const googleOAuth = async (startOAuthFlow: any) => {
  try {
    const redirectUrl = Linking.createURL("/(root)/(tabs)/home");
    console.log("Redirect URL for OAuth:", redirectUrl);

    const { createdSessionId, setActive, signUp } = await startOAuthFlow({
      redirectUrl,
    });

    if (createdSessionId) {
      console.log("Session successfully created with ID:", createdSessionId);

      if (setActive) {
        console.log("Activating session...");
        await setActive({ session: createdSessionId });
        console.log("Session activated successfully!");

        if (signUp.createdUserId) {
          console.log("Sending user data to backend...");
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: `${signUp.firstName} ${signUp.lastName}`,
              email: signUp.emailAddress,
              clerkId: signUp.createdUserId,
            }),
          });
          console.log("User data successfully sent to the backend.");
        }

        return {
          success: true,
          code: "success",
          message: "You have successfully signed in with Google",
        };
      }
    }

    console.error("Session creation was incomplete.");
    return {
      success: false,
      message: "An error occurred while signing in with Google",
    };
  } catch (err: any) {
    console.error("Google OAuth Error:", err);
    return {
      success: false,
      code: err.code || "unknown_error",
      message:
        err?.errors?.[0]?.longMessage ||
        "An unexpected error occurred during Google sign-in.",
    };
  }
};
