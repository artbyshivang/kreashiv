import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification
} from "firebase/auth";

import auth from "./auth";

import {
    doc,
    setDoc,
} from "firebase/firestore";

import { db } from "./config";




const signup = async (
    name,
    phone,
    email,
    password
) => {
    try {
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await updateProfile(auth.currentUser, {
    displayName: name,
});


console.log("Sending verification mail...");

await sendEmailVerification(userCredential.user);

console.log("Verification mail sent");




        console.log("Signup Success");



        await setDoc(
            doc(
                db,
                "users",
                userCredential.user.uid
            ),
            {
                uid: userCredential.user.uid,
                name: name,
                email: email,
                phone: phone,
                premium: false,
                createdAt: new Date(),
            }
        );



        return {
            success: true,
            user: userCredential.user,
        };
    } catch (error) {
        console.log("Signup Error:", error);

        return {
            success: false,
            error: error.message,
        };
    }
};

export default signup;