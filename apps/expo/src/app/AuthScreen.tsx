// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
// } from "react-native";
// import { Image } from "expo-image";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";

// export default function AuthScreen() {
//   const handleGoogleLogin = async () => {
//     // Implement Google OAuth login
//     try {
//       // This will redirect to your backend auth endpoint
//       console.log("Google login clicked");
//     } catch (error) {
//       console.error("Google login failed:", error);
//     }
//   };

//   const handleAppleLogin = () => {
//     // Placeholder - no functionality required
//     console.log("Apple login clicked");
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         {/* Logo and Title */}
//         <View style={styles.header}>
//           <Text style={styles.title}>EveryNote</Text>
//           <Text style={styles.subtitle}>
//             Capture your thoughts, your way.{"\n"}
//             Text, voice, or media—EveryNote makes it effortless to{"\n"}
//             record your day and reflect with AI-powered clarity.
//           </Text>
//         </View>

//         {/* Image Illustration */}
//         <View style={styles.illustrationContainer}>
//           <Image
// source={require("../../assets/image.png")}
// style={styles.illustration}
//             // resizeMode="contain"
//           />
//         </View>

//         {/* Login Buttons */}
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={styles.googleButton}
//             onPress={handleGoogleLogin}
//           >
//             <Ionicons name="logo-google" size={20} color="#000" />
//             <Text style={styles.googleButtonText}>Log in with Google</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.appleButton}
//             onPress={handleAppleLogin}
//           >
//             <Ionicons name="logo-apple" size={20} color="#fff" />
//             <Text style={styles.appleButtonText}>Log in with Apple</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Terms */}
//         <Text style={styles.terms}>
//           By continuing, you agree to our Terms of Service{"\n"}
//           and Privacy Policy.
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "black",
//   },
//   gradient: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 32,
//     paddingTop: 60,
//     paddingBottom: 40,
//   },
//   header: {
//     marginBottom: 60,
//   },
//   logoContainer: {
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: "bold",
//     color: "#ffffff",
//     marginBottom: 16,
//   },
//   subtitle: {
//     fontSize: 13.1,
//     color: "#a0a0a0",
//     lineHeight: 24,
//   },
//   illustrationContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 60,
//   },
//   illustration: {
//     width: 400,
//     height: 400,
//     filter: "grayscale(100%)",
//     backgroundColor: "transparent", // This makes the image white
//     opacity: 0.8, // Adjust for desired intensity
//   },
//   buttonContainer: {
//     gap: 16,
//     marginBottom: 32,
//   },
//   googleButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#ffffff",
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     gap: 12,
//   },
//   googleButtonText: {
//     color: "#000000",
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   appleButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#000000",
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     gap: 12,
//     borderWidth: 1,
//     borderColor: "#333333",
//   },
//   appleButtonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   terms: {
//     fontSize: 12,
//     color: "#666666",
//     textAlign: "center",
//     lineHeight: 16,
//   },
// });

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { api } from "~/utils/api";
import { useAuth } from "~/contexts/AuthContext";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

// Replace the existing redirectUri configuration with:
const useProxy = Constants.executionEnvironment !== "standalone";
const redirectUri = AuthSession.makeRedirectUri({
  native: `${Constants.expoConfig?.scheme}://`,

});

// Debug
console.log("App Ownership:", Constants.appOwnership);
console.log("Redirect URI:", redirectUri);

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  // Google OAuth configuration
  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://www.googleapis.com/oauth2/v4/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
      scopes: ["openid", "profile", "email"],
      extraParams: {
        access_type: "offline",
      },
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
    },
    discovery,
  );

  const googleAuthMutation = api.auth.googleSignIn.useMutation({
    onSuccess: async (data) => {
      console.log("Auth successful:", data);
      try {
        await signIn("google");
        router.replace("./HomeScreen");
      } catch (error) {
        console.error("Failed to save auth data:", error);
        Alert.alert("Error", "Failed to save authentication data");
      }
      setLoading(false);
    },
    onError: (error) => {
      console.error("Auth failed:", error);
      Alert.alert("Authentication Error", "Failed to sign in with Google");
      setLoading(false);
    },
  });

  React.useEffect(() => {
    if (response?.type === "success" && response.params.code) {
      const { code } = response.params;
      handleGoogleAuthCode(code);
    } else if (response?.type === "error") {
      console.error("Auth error:", response.error);
      Alert.alert(
        "Authentication Error",
        response.error?.message || "Unknown error",
      );
      setLoading(false);
    }
  }, [response]);

  const handleGoogleAuthCode = async (code: string) => {
    try {
      await googleAuthMutation.mutateAsync({
        code,
        redirectUri,
      });
    } catch (error) {
      console.error("Failed to exchange code:", error);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await promptAsync();
    } catch (error) {
      console.error("Google login failed:", error);
      Alert.alert("Error", "Failed to initiate Google sign-in");
      setLoading(false);
    }
  };

  const handleAppleLogin = () => {
    // Placeholder - no functionality required
    console.log("Apple login clicked");
    Alert.alert("Coming Soon", "Apple Sign-In will be available soon!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <Text style={styles.title}>EveryNote</Text>
          <Text style={styles.subtitle}>
            Capture your thoughts, your way.{"\n"}
            Text, voice, or media—EveryNote makes it effortless to{"\n"}
            record your day and reflect with AI-powered clarity.
          </Text>
        </View>

        {/* Image Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../assets/image.png")}
            style={styles.illustration}
            // resizeMode="contain"
          />
        </View>

        {/* Login Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.googleButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={loading || !request}
          >
            {loading ? (
              <Text style={styles.googleButtonText}>Signing in...</Text>
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#000" />
                <Text style={styles.googleButtonText}>Log in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.appleButton}
            onPress={handleAppleLogin}
            disabled={loading}
          >
            <Ionicons name="logo-apple" size={20} color="#fff" />
            <Text style={styles.appleButtonText}>Log in with Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service{"\n"}
          and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 60,
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 13.1,
    color: "#a0a0a0",
    lineHeight: 24,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
  illustration: {
    width: 400,
    height: 400,
    filter: "grayscale(100%)",
    backgroundColor: "transparent",
    opacity: 0.8,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },
  appleButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  terms: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    lineHeight: 16,
  },
});

