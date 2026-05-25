import React, {
  createContext,
  useEffect,
  useState,
} from "react";

import auth from "../firebase/auth";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

// import { registerForPushNotificationsAsync } from "../utils/notifications";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (currentUser) {

          if (!currentUser.emailVerified) {
 
            setUser(currentUser);
 
            setLoading(false);
 
            return;

          }

          try {
            const userRef = doc(
              db,
              "users",
              currentUser.uid
            );


            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              setUser({
                ...currentUser,
                ...userSnap.data(),
              });

              // PUSH TOKEN SAVE
             /* const token =
                await registerForPushNotificationsAsync();

              if (token) {
                await updateDoc(userRef, {
                  pushToken: token,
                });
              }  */

            } else {
              setUser(currentUser);
            }

          } catch (error) {
            console.log(error);
            setUser(currentUser);
          }

        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return unsubscribe;
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