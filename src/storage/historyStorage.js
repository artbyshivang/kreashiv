import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "PROMPT_HISTORY";

/* SAVE */
export const savePromptToHistory = async (promptData) => {
    try {
        const existing = await AsyncStorage.getItem(HISTORY_KEY);

        const history = existing ? JSON.parse(existing) : [];

        history.unshift(promptData);

        await AsyncStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(history)
        );
    } catch (e) {
        console.log("Save error:", e);
    }
};

/* GET */
export const getHistory = async () => {
    try {
        const data = await AsyncStorage.getItem(HISTORY_KEY);

        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.log("Get error:", e);
        return [];
    }
};

/* DELETE */
export const deletePromptFromHistory = async (id) => {
    try {
        const data = await AsyncStorage.getItem(HISTORY_KEY);
        if (data) {
            let history = JSON.parse(data);
            history = history.filter(item => item.id !== id);
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        }
    } catch (e) {
        console.log("Delete error:", e);
    }
};


const FOLDER_PROMPTS_KEY = "FOLDER_PROMPTS";

/* SAVE PROMPT TO FOLDER */
export const savePromptToFolder = async (
    folderId,
    promptData
) => {

    try {

        const existing =
            await AsyncStorage.getItem(
                FOLDER_PROMPTS_KEY
            );

        let folderData =
            existing
                ? JSON.parse(existing)
                : {};

        if (!folderData[folderId]) {
            folderData[folderId] = [];
        }

        /* CHECK DUPLICATE */

        const alreadyExists =
            folderData[folderId].some(
                item => item.id === promptData.id
            );

        if (alreadyExists) {

            return "EXISTS";

        }





        folderData[folderId].unshift(promptData);

        await AsyncStorage.setItem(
            FOLDER_PROMPTS_KEY,
            JSON.stringify(folderData)
        );

    } catch (e) {

        console.log("Folder Save Error:", e);

    }
};


/* CLEAR ALL HISTORY */
export const clearHistory = async () => {
    try {

        await AsyncStorage.removeItem(
            HISTORY_KEY
        );

        await AsyncStorage.removeItem(
            "FOLDER_PROMPTS"
        );

    } catch (e) {

        console.log(
            "Clear History Error:",
            e
        );

    }
};
