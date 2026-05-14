import React from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Alert,
    Modal,
} from 'react-native';

import {
    getHistory
} from "../storage/historyStorage";



import { ThemeContext }
    from "../theme/ThemeContext";

import { useContext }
    from "react";


import * as Clipboard
    from 'expo-clipboard';



import {
    useEffect,
    useState
} from "react";

import AsyncStorage
    from "@react-native-async-storage/async-storage";


import {
    deletePromptFromHistory
} from "../storage/historyStorage";



import { Ionicons } from '@expo/vector-icons';

export default function FolderScreen({ route, navigation }) {

    const { folder } = route.params;

    const { theme } =
        useContext(ThemeContext);

    const [prompts, setPrompts] = useState([]);

    const [historyPrompts, setHistoryPrompts] =
        useState([]);

    const [addModal, setAddModal] =
        useState(false);




    useEffect(() => {

        loadFolderPrompts();

    }, []);

    const loadFolderPrompts = async () => {

        try {

            const data =
                await AsyncStorage.getItem(
                    "FOLDER_PROMPTS"
                );

            const parsed =
                data ? JSON.parse(data) : {};

            setPrompts(
                parsed[folder.id] || []
            );

        } catch (e) {

            console.log(e);

        }

    };

    const copyPrompt = async (text) => {

        await Clipboard.setStringAsync(text);

        Alert.alert(
            "Copied",
            "Prompt copied successfully"
        );

    };





    const removeFromFolder = async (
        indexToRemove
    ) => {

        Alert.alert(
            "Remove Prompt",
            "Remove from this folder only?",
            [
                {
                    text: "Cancel",
                },

                {
                    text: "Remove",

                    onPress: async () => {

                        try {

                            const data =
                                await AsyncStorage.getItem(
                                    "FOLDER_PROMPTS"
                                );

                            const parsed =
                                data
                                    ? JSON.parse(data)
                                    : {};

                            const updatedPrompts =
                                prompts.filter(
                                    (_, index) =>
                                        index !== indexToRemove
                                );

                            parsed[folder.id] =
                                updatedPrompts;

                            await AsyncStorage.setItem(
                                "FOLDER_PROMPTS",
                                JSON.stringify(parsed)
                            );

                            setPrompts(updatedPrompts);

                        } catch (e) {

                            console.log(e);

                        }

                    }
                }
            ]
        );

    };







    /* DELETE PROMPT */

    const deletePrompt = async (
        indexToDelete,
        promptItem
    ) => {

        Alert.alert(
            "Delete Prompt",
            "Remove this prompt?",
            [
                {
                    text: "Cancel",
                },

                {
                    text: "Delete",
                    style: "destructive",

                    onPress: async () => {

                        try {

                            /* REMOVE FROM FOLDER */

                            const data =
                                await AsyncStorage.getItem(
                                    "FOLDER_PROMPTS"
                                );

                            const parsed =
                                data ? JSON.parse(data) : {};

                            const updatedPrompts =
                                prompts.filter(
                                    (_, index) =>
                                        index !== indexToDelete
                                );

                            parsed[folder.id] =
                                updatedPrompts;

                            await AsyncStorage.setItem(
                                "FOLDER_PROMPTS",
                                JSON.stringify(parsed)
                            );

                            setPrompts(updatedPrompts);

                            /* REMOVE FROM HISTORY */

                            await deletePromptFromHistory(
                                promptItem.id
                            );

                        } catch (e) {

                            console.log(e);

                        }

                    }
                }
            ]
        );

    };

    const openAddPromptModal = async () => {

        const data =
            await getHistory();

        setHistoryPrompts(data);

        setAddModal(true);

    };

    const addPromptToFolder = async (
        promptItem
    ) => {

        try {

            const data =
                await AsyncStorage.getItem(
                    "FOLDER_PROMPTS"
                );

            const parsed =
                data
                    ? JSON.parse(data)
                    : {};

            if (!parsed[folder.id]) {
                parsed[folder.id] = [];
            }

            const alreadyExists =
                parsed[folder.id].some(
                    item => item.id === promptItem.id
                );

            if (alreadyExists) {

                Alert.alert(
                    "Duplicate",
                    "Prompt already exists"
                );

                return;
            }

            parsed[folder.id].unshift(
                promptItem
            );

            await AsyncStorage.setItem(
                "FOLDER_PROMPTS",
                JSON.stringify(parsed)
            );

            setPrompts(parsed[folder.id]);

            setAddModal(false);

            Alert.alert(
                "Success",
                "Prompt added"
            );

        } catch (e) {

            console.log(e);

        }

    };






    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: theme.background,
            }}
        >

            {/* HEADER */}
            <View
                style={{
                    paddingTop: 55,
                    paddingBottom: 22,
                    paddingHorizontal: 20,
                    backgroundColor: theme.card,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >

                {/* BACK BUTTON */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        position: 'absolute',
                        left: 20,
                        top: 55,
                        zIndex: 10,
                    }}
                >

                    <Ionicons
                        name="arrow-back"
                        size={28}
                        color={theme.text}
                    />

                </TouchableOpacity>

                {/* TITLE */}
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                    }}
                >

                    <Text
                        style={{
                            color: theme.text,
                            fontSize: 22,
                            fontWeight: '600',
                            letterSpacing: 0.5,
                        }}
                    >
                        {folder.title}
                    </Text>

                </View>

                {/* ADD BUTTON */}
                <TouchableOpacity
                    onPress={openAddPromptModal}
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 55,
                        zIndex: 10,
                    }}
                >

                    <Ionicons
                        name="add"
                        size={30}
                        color={theme.primary}
                    />

                </TouchableOpacity>





            </View>

            {/* CONTENT */}
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 30,
                }}
            >

                {
                    prompts.length === 0 ? (

                        <>
                            {/* ICON */}
                            <View
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 30,
                                    backgroundColor: theme.card,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 24,
                                }}
                            >

                                <Ionicons
                                    name="folder-open-outline"
                                    size={50}
                                    color="#22C55E"
                                />

                            </View>

                            {/* TITLE */}
                            <Text
                                style={{
                                    color: theme.text,
                                    fontSize: 26,
                                    fontWeight: 'bold',
                                    marginBottom: 10,
                                }}
                            >
                                Empty Folder
                            </Text>

                            {/* SUBTITLE */}
                            <Text
                                style={{
                                    color: theme.subText,
                                    fontSize: 16,
                                    textAlign: 'center',
                                    lineHeight: 24,
                                }}
                            >
                                No prompts saved in this folder yet.
                                {"\n"}
                                Create and save prompts to see them here.
                            </Text>

                            {/* BUTTON */}
                            <TouchableOpacity
                                onPress={openAddPromptModal}
                                style={{
                                    marginTop: 30,
                                    backgroundColor: '#22C55E',
                                    paddingHorizontal: 28,
                                    paddingVertical: 14,
                                    borderRadius: 999,
                                }}
                            >

                                <Text
                                    style={{
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: 16,
                                    }}
                                >
                                    Add Prompt
                                </Text>

                            </TouchableOpacity>

                        </>

                    ) : (

                        <FlatList
                            data={prompts}
                            keyExtractor={(item, index) =>
                                index.toString()
                            }
                            style={{ width: '100%' }}
                            contentContainerStyle={{
                                padding: 20,
                                paddingBottom: 40,
                            }}
                            showsVerticalScrollIndicator={false}

                            renderItem={({ item, index }) => (

                                <View
                                    style={{
                                        backgroundColor: theme.card,
                                        borderRadius: 18,
                                        padding: 18,
                                        marginBottom: 16,
                                        borderWidth: 1,
                                        borderColor: theme.border,
                                    }}
                                >

                                    {/* TOP ACTIONS */}
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end',
                                            marginBottom: 12,
                                        }}
                                    >

                                        {/* COPY */}
                                        <TouchableOpacity
                                            onPress={() =>
                                                copyPrompt(item.prompt)
                                            }
                                            style={{
                                                marginRight: 18,
                                            }}
                                        >

                                            <Ionicons
                                                name="copy-outline"
                                                size={22}
                                                color={theme.text}
                                            />

                                        </TouchableOpacity>

                                        {/* REMOVE */}
                                        <TouchableOpacity
                                            onPress={() =>
                                                removeFromFolder(index)
                                            }
                                            style={{
                                                marginRight: 18,
                                            }}
                                        >

                                            <Ionicons
                                                name="remove-circle-outline"
                                                size={22}
                                                color="#f59e0b"
                                            />

                                        </TouchableOpacity>

                                        {/* DELETE */}
                                        <TouchableOpacity
                                            onPress={() =>
                                                deletePrompt(index, item)
                                            }
                                        >

                                            <Ionicons
                                                name="trash-outline"
                                                size={22}
                                                color="#ef4444"
                                            />

                                        </TouchableOpacity>

                                    </View>

                                    {/* CATEGORY */}
                                    <View
                                        style={{
                                            alignSelf: 'flex-start',
                                            backgroundColor: theme.background,
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 999,
                                            marginBottom: 12,
                                        }}
                                    >

                                        <Text
                                            style={{
                                                color: '#22C55E',
                                                fontWeight: 'bold',
                                                fontSize: 11,
                                            }}
                                        >
                                            {item.category}
                                        </Text>

                                    </View>

                                    {/* INPUT */}
                                    {
                                        item.input && (
                                            <Text
                                                style={{
                                                    color: theme.text,
                                                    fontSize: 18,
                                                    fontWeight: 'bold',
                                                    marginBottom: 10,
                                                }}
                                            >
                                                {item.input}
                                            </Text>
                                        )
                                    }

                                    {/* PROMPT */}
                                    <Text
                                        style={{
                                            color: theme.subText,
                                            lineHeight: 24,
                                            fontSize: 15,
                                        }}
                                    >
                                        {item.prompt}
                                    </Text>

                                </View>

                            )}
                        />

                    )
                }

            </View>

            {/* ADD PROMPT MODAL */}
            <Modal
                visible={addModal}
                transparent
                animationType="slide"
            >

                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'flex-end',
                    }}
                >

                    <View
                        style={{
                            backgroundColor: theme.card,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            padding: 20,
                            maxHeight: '80%',
                        }}
                    >

                        <Text
                            style={{
                                color: theme.text,
                                fontSize: 22,
                                fontWeight: 'bold',
                                marginBottom: 20,
                            }}
                        >
                            Select Prompt
                        </Text>

                        <ScrollView>


                            {
                                historyPrompts.length === 0 ? (

                                    <View
                                        style={{
                                            alignItems: 'center',
                                            marginTop: 50,
                                            paddingBottom: 40,
                                        }}
                                    >

                                        <Ionicons
                                            name="document-text-outline"
                                            size={60}
                                            color={theme.border}
                                        />

                                        <Text
                                            style={{
                                                color: theme.text,
                                                fontSize: 18,
                                                fontWeight: 'bold',
                                                marginTop: 14,
                                            }}
                                        >
                                            No Prompts Found
                                        </Text>

                                        <Text
                                            style={{
                                                color: theme.subText,
                                                marginTop: 6,
                                                textAlign: 'center',
                                                lineHeight: 22,
                                            }}
                                        >
                                            Create prompts first to
                                            add them into folders.
                                        </Text>

                                    </View>

                                ) : (

                                    historyPrompts.map(item => (

                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() =>
                                                addPromptToFolder(item)
                                            }
                                            style={{
                                                backgroundColor: theme.background,
                                                padding: 16,
                                                borderRadius: 16,
                                                marginBottom: 14,
                                            }}
                                        >

                                            <Text
                                                style={{
                                                    color: theme.text,
                                                    fontWeight: 'bold',
                                                    marginBottom: 6,
                                                }}
                                                numberOfLines={1}
                                            >
                                                {item.input}
                                            </Text>

                                            <Text
                                                style={{
                                                    color: theme.subText,
                                                }}
                                                numberOfLines={2}
                                            >
                                                {item.prompt}
                                            </Text>

                                        </TouchableOpacity>

                                    ))

                                )
                            }

                        </ScrollView>

                        <TouchableOpacity
                            onPress={() =>
                                setAddModal(false)
                            }
                            style={{
                                marginTop: 20,
                                alignItems: 'center',
                            }}
                        >

                            <Text
                                style={{
                                    color: '#ef4444',
                                    fontWeight: 'bold',
                                }}
                            >
                                Cancel
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>







        </SafeAreaView>
    );
}