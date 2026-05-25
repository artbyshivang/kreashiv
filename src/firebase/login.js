import {
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";

import auth from "./auth";

const login = async (email, password) => {
    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        console.log("Login Success");

        return {
            success: true,
            user: userCredential.user,
        };

    } catch (error) {

        console.log("Login Error:", error);

        return {
            success: false,
           error: error.code,
        };
    }
};

export default login;