import {
  createContext,
  useEffect,
  useState,
} from "react";

import auth from "../firebase/auth";

import {
  onAuthStateChanged,
  reload,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { registerForPushNotificationsAsync } from "../utils/notifications";
import * as SplashScreen from "expo-splash-screen";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth is not initialized. Skipping auth listener.");
      setLoading(false);
      SplashScreen.hideAsync().catch(() => {});
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
      SplashScreen.hideAsync().catch(() => {});
    }, 1000);

    let unsubSnapshot = null;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          if (unsubSnapshot) {
            unsubSnapshot();
            unsubSnapshot = null;
          }

          if (currentUser) {
            const extractAuthData = (u) => ({
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              phoneNumber: u.phoneNumber,
              emailVerified: u.emailVerified,
              photoURL: u.photoURL,
            });

            const baseAuthData = extractAuthData(currentUser);

            // Set user immediately so app screen opens instantly
            setUser(baseAuthData);

            // Non-blocking reload attempt in background
            reload(currentUser).catch((e) =>
              console.log("Background user reload error:", e)
            );

            if (!currentUser.emailVerified) {
              return;
            }

            try {
              if (db) {
                const userRef = doc(db, "users", currentUser.uid);

                // Real-time listener for Firestore user document (updates in background)
                unsubSnapshot = onSnapshot(
                  userRef,
                  (userSnap) => {
                    if (userSnap.exists()) {
                      setUser((prev) => ({
                        ...prev,
                        ...userSnap.data(),
                      }));
                    }
                  },
                  (error) => {
                    console.log("Firestore snapshot error:", error);
                  }
                );

                // Save push token if available
                registerForPushNotificationsAsync().then((token) => {
                  if (token) {
                    updateDoc(userRef, { pushToken: token }).catch((err) =>
                      console.log("Push token update error:", err)
                    );
                  }
                }).catch(() => {});
              }
            } catch (error) {
              console.log("User doc setup error:", error);
            }
          } else {
            setUser(null);
          }
        } catch (authErr) {
          console.log("Auth callback error:", authErr);
        } finally {
          setLoading(false);
          SplashScreen.hideAsync().catch(() => {});
        }
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}