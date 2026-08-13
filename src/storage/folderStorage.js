import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../firebase/auth";

const getFolderKey = (userId) => {
    const uid = userId || auth?.currentUser?.uid || "guest";
    return `APP_FOLDERS_${uid}`;
};

/* SAVE FOLDERS */
export const saveFolders = async (folders, userId) => {
    try {
        const key = getFolderKey(userId);
        await AsyncStorage.setItem(
            key,
            JSON.stringify(folders)
        );
    } catch (e) {
        console.log("Save Folder Error:", e);
    }
};

/* GET FOLDERS */
export const getFolders = async (userId) => {
    try {
        const key = getFolderKey(userId);
        let data = await AsyncStorage.getItem(key);

        if (!data && (userId || auth?.currentUser?.uid)) {
            const legacyData = await AsyncStorage.getItem("APP_FOLDERS");
            if (legacyData) {
                await AsyncStorage.setItem(key, legacyData);
                await AsyncStorage.removeItem("APP_FOLDERS");
                data = legacyData;
            }
        }

        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.log("Get Folder Error:", e);
        return [];
    }
};