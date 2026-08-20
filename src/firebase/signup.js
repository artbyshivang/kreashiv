import {
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";

import auth from "./auth";

import {
    doc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { db } from "./config";




const signup = async (
    name,
    phone,
    email,
    password
) => {
    
    phone = phone.replace(/\s+/g, "");
    
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


console.log("Sending verification mail via Resend...");

// Call our custom backend API instead of Firebase default
const res = await fetch('https://kreashiv-api.onrender.com/api/send-verification-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email })
});

const data = await res.json();
if (!data.success) {
    console.log("Failed to send verification email:", data.error);
} else {
    console.log("Verification mail sent successfully via Resend");
}




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
                dailyUsage: {
                    date: new Date().toISOString().split("T")[0],
                    count: 0,
                },
                credits: 1000,
                createdAt: serverTimestamp(),
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