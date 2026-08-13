import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../firebase/auth";

const getHistoryKey = (userId) => {
    const uid = userId || auth?.currentUser?.uid || "guest";
    return `PROMPT_HISTORY_${uid}`;
};

const getFolderPromptsKey = (userId) => {
    const uid = userId || auth?.currentUser?.uid || "guest";
    return `FOLDER_PROMPTS_${uid}`;
};

/* SAVE */
export const savePromptToHistory = async (promptData, userId) => {
    try {
        const key = getHistoryKey(userId);
        const existing = await AsyncStorage.getItem(key);
        const history = existing ? JSON.parse(existing) : [];

        history.unshift(promptData);

        await AsyncStorage.setItem(
            key,
            JSON.stringify(history)
        );
    } catch (e) {
        console.log("Save error:", e);
    }
};

/* GET */
export const getHistory = async (userId) => {
    try {
        const key = getHistoryKey(userId);
        let data = await AsyncStorage.getItem(key);

        if (!data && (userId || auth?.currentUser?.uid)) {
            const legacyData = await AsyncStorage.getItem("PROMPT_HISTORY");
            if (legacyData) {
                await AsyncStorage.setItem(key, legacyData);
                await AsyncStorage.removeItem("PROMPT_HISTORY");
                data = legacyData;
            }
        }

        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.log("Get error:", e);
        return [];
    }
};

/* DELETE */
export const deletePromptFromHistory = async (id, userId) => {
    try {
        const key = getHistoryKey(userId);
        const data = await AsyncStorage.getItem(key);
        if (data) {
            let history = JSON.parse(data);
            history = history.filter(item => item.id !== id);
            await AsyncStorage.setItem(key, JSON.stringify(history));
        }
    } catch (e) {
        console.log("Delete error:", e);
    }
};

/* SAVE PROMPT TO FOLDER */
export const savePromptToFolder = async (
    folderId,
    promptData,
    userId
) => {
    try {
        const key = getFolderPromptsKey(userId);
        const existing = await AsyncStorage.getItem(key);
        let folderData = existing ? JSON.parse(existing) : {};

        if (!existing && (userId || auth?.currentUser?.uid)) {
            const legacyData = await AsyncStorage.getItem("FOLDER_PROMPTS");
            if (legacyData) {
                folderData = JSON.parse(legacyData);
                await AsyncStorage.setItem(key, legacyData);
                await AsyncStorage.removeItem("FOLDER_PROMPTS");
            }
        }

        if (!folderData[folderId]) {
            folderData[folderId] = [];
        }

        const alreadyExists = folderData[folderId].some(
            item => item.id === promptData.id
        );

        if (alreadyExists) {
            return "EXISTS";
        }

        folderData[folderId].unshift(promptData);

        await AsyncStorage.setItem(
            key,
            JSON.stringify(folderData)
        );
    } catch (e) {
        console.log("Folder Save Error:", e);
    }
};

/* CLEAR ALL HISTORY */
export const clearHistory = async (userId) => {
    try {
        const hKey = getHistoryKey(userId);
        const fKey = getFolderPromptsKey(userId);

        await AsyncStorage.removeItem(hKey);
        await AsyncStorage.removeItem(fKey);
    } catch (e) {
        console.log("Clear History Error:", e);
    }
};
