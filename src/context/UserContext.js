import {
  createContext,
  useEffect,
  useState,
} from "react";
import * as SplashScreen from "expo-splash-screen";

import auth from "../firebase/auth";

import {
  onAuthStateChanged,
  reload,
  signOut,
} from "@react-native-firebase/auth";

import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from "@react-native-firebase/firestore";

import { registerForPushNotificationsAsync } from "../utils/notifications";

const db = getFirestore();


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
      console.warn(
        "Firebase Auth is not initialized. Skipping auth listener."
      );

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
          // Remove previous Firestore listener
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

            // Show user immediately
            setUser(baseAuthData);

            // Background reload
            reload(currentUser).catch((e) => {
              console.log("Background user reload error:", e);
            });

            if (!currentUser.emailVerified) {
              return;
            }

            try {
              const userRef = doc(
                db,
                "users",
                currentUser.uid
              );

              // Real-time Firestore listener
              unsubSnapshot = onSnapshot(
                userRef,
                async (userSnap) => {
                  const snapExists = typeof userSnap.exists === 'function' ? userSnap.exists() : Boolean(userSnap.exists);
                  if (snapExists) {
                    const data = userSnap.data();
                    setUser((prev) => ({
                      ...prev,
                      ...data,
                    }));

                    // Auto-populate & Auto-sync emailIndex & phoneIndex
                    try {
                      // Sync Auth email to Firestore if it changed via verification link
                      if (currentUser.email && data.email && currentUser.email !== data.email) {
                        const newEmail = currentUser.email.toLowerCase().trim();
                        const oldEmail = data.email.toLowerCase().trim();

                        // 1. Update Firestore user doc
                        await updateDoc(userRef, { email: newEmail });

                        // 2. Remove old email from index
                        await deleteDoc(doc(db, "emailIndex", oldEmail));

                        // 3. Add new email to index
                        await setDoc(doc(db, "emailIndex", newEmail), { uid: currentUser.uid });
                        
                        // Update local data variable so the rest of the app gets the fresh email
                        data.email = newEmail;
                      }

                      if (data.email) {
                        const emailKey = data.email.toLowerCase().trim();
                        const emailRef = doc(db, "emailIndex", emailKey);
                        const emailSnap = await getDoc(emailRef);
                        const emailExists = typeof emailSnap.exists === "function"
                          ? emailSnap.exists()
                          : Boolean(emailSnap.exists);
                        if (!emailExists) {
                          await setDoc(emailRef, { uid: currentUser.uid });
                        }
                      }
                      if (data.phone) {
                        const phoneKey = data.phone.replace(/\s/g, "");
                        const phoneRef = doc(db, "phoneIndex", phoneKey);
                        const phoneSnap = await getDoc(phoneRef);
                        const phoneExists = typeof phoneSnap.exists === "function"
                          ? phoneSnap.exists()
                          : Boolean(phoneSnap.exists);
                        if (!phoneExists) {
                          await setDoc(phoneRef, { uid: currentUser.uid });
                        }
                      }
                    } catch (indexErr) {
                      console.log("Index auto-populate/sync error:", indexErr);
                    }
                  }
                },
                (error) => {
                  console.log(
                    "Firestore snapshot error:",
                    error
                  );
                }
              );

              // Save push notification token
              registerForPushNotificationsAsync()
                .then((token) => {
                  if (token) {
                    updateDoc(userRef, {
                      pushToken: token,
                    }).catch((err) => {
                      console.log(
                        "Push token update error:",
                        err
                      );
                    });
                  }
                })
                .catch((err) => {
                  console.log(
                    "Push notification registration error:",
                    err
                  );
                });
            } catch (error) {
              console.log(
                "User doc setup error:",
                error
              );
            }
          } else {
            setUser(null);
          }
        } catch (authErr) {
          console.log(
            "Auth callback error:",
            authErr
          );
        } finally {
          setLoading(false);
          SplashScreen.hideAsync().catch(() => {});
        }
      }
    );

    return () => {
      clearTimeout(timer);

      unsubscribe();

      if (unsubSnapshot) {
        unsubSnapshot();
      }
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("Logout error:", error);
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