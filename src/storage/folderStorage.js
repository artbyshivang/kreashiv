import AsyncStorage from "@react-native-async-storage/async-storage";

const FOLDER_KEY = "APP_FOLDERS";

/* SAVE FOLDERS */
export const saveFolders = async (folders) => {
    try {

        await AsyncStorage.setItem(
            FOLDER_KEY,
            JSON.stringify(folders)
        );

    } catch (e) {

        console.log("Save Folder Error:", e);

    }
};

/* GET FOLDERS */
export const getFolders = async () => {

    try {

        const data =
            await AsyncStorage.getItem(FOLDER_KEY);

        return data ? JSON.parse(data) : [];

    } catch (e) {

        console.log("Get Folder Error:", e);

        return [];
    }
};