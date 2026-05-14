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

        const unsubscribe =
            onAuthStateChanged(
                auth,
                (currentUser) => {

                    setUser(currentUser);

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