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
} from "firebase/firestore";

import { db } from "../firebase/config";




export const UserContext =
    createContext();

export function UserProvider({
    children,
}) {

    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(
            auth,
            async (currentUser) => {

                if (currentUser) {
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