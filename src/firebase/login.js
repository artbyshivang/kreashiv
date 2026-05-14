import {
    signInWithEmailAndPassword,
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

        if (
            !userCredential.user.emailVerified
        ) {

            return {
                success: false,
                error:
                    "Please verify your email first.",
            };
        }









        console.log("Login Success");

        return {
            success: true,
            user: userCredential.user,
        };

    } catch (error) {

        console.log("Login Error:", error);

        return {
            success: false,
            error: error.message,
        };
    }
};

export default login;