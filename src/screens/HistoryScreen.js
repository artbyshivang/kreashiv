import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';

import AsyncStorage
  from "@react-native-async-storage/async-storage";


import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ThemeContext } from "../theme/ThemeContext";
import { getHistory, deletePromptFromHistory } from "../storage/historyStorage";

import {
  savePromptToFolder
} from "../storage/historyStorage";

import {
  getFolders
} from "../storage/folderStorage";

import {
  Modal
} from "react-native";




/* 🔥 Card */
const HistoryCard = ({ item, onDelete, onCopy, onReuse, onAddToFolder, theme }) => (
  <View style={{ backgroundColor: theme.card, padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border }}>

    {/* Top */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Text style={{ color: theme.subText, fontSize: 12 }}>{item.time}</Text>

      <View style={{ backgroundColor: theme.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
        <Text style={{ color: theme.primary, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
          {item.category}
        </Text>
      </View>
    </View>

    {/* Input Idea */}
    {item.input ? (
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }} numberOfLines={2}>
        {item.input}
      </Text>
    ) : null}

    {/* Prompt */}
    <Text style={{ color: theme.subText, marginBottom: 20, lineHeight: 22 }} numberOfLines={3}>
      {item.prompt}
    </Text>

    {/* Actions */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

      <View style={{ flexDirection: 'row' }}>

        {/* Reuse */}
        <TouchableOpacity
          onPress={() => onReuse(item)}
          style={{ backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginRight: 12 }}
        >
          <Ionicons name="refresh" size={16} color="white" />
          <Text style={{ color: 'white', marginLeft: 4, fontWeight: '600' }}>Reuse</Text>
        </TouchableOpacity>

        {/* ADD TO FOLDER */}
        <TouchableOpacity
          onPress={() => onAddToFolder(item)}
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
            marginRight: 12
          }}
        >

          <Ionicons
            name="folder-open-outline"
            size={16}
            color={theme.text}
          />

          <Text
            style={{
              color: theme.text,
              marginLeft: 4,
              fontWeight: '600'
            }}
          >
            Folder
          </Text>

        </TouchableOpacity>



        {/* Copy */}
        <TouchableOpacity
          onPress={() => onCopy(item.prompt)}
          style={{ borderWidth: 1, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}
        >
          <Ionicons name="copy-outline" size={16} color={theme.text} />
          <Text style={{ color: theme.text, marginLeft: 4, fontWeight: '600' }}>Copy</Text>
        </TouchableOpacity>

      </View>

      {/* Delete */}
      <TouchableOpacity onPress={() => onDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>

    </View>

  </View>
);

export default function HistoryScreen() {

  const navigation = useNavigation(); // ✅ FIX
  const { theme } = useContext(ThemeContext);

  const [historyData, setHistoryData] = useState([]);

  const [folders, setFolders] = useState([]);

  const [folderModal, setFolderModal] =
    useState(false);

  const [selectedPrompt, setSelectedPrompt] =
    useState(null);

  const selectFolder = async (folder) => {

    const result =
      await savePromptToFolder(
        folder.id,
        selectedPrompt
      );

    setFolderModal(false);

    if (result === "EXISTS") {

      Alert.alert(
        "Duplicate Prompt",
        "This prompt already exists in the folder."
      );

      return;
    }

    Alert.alert(
      "Success",
      "Prompt added to folder"
    );

  };


  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {

        const foldersData =
          await getFolders();

        setFolders(
          foldersData
        );


        const data = await getHistory();
        setHistoryData(data);
      };
      loadHistory();
    }, [])
  );







  /* COPY */
  const handleCopy = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert("Copied", "Prompt copied to clipboard");
    } catch (e) {
      Alert.alert("Error", "Copy failed");
    }
  };






  /* DELETE */
  const handleDelete = (id) => {
    Alert.alert(
      "Delete",
      "Delete this prompt?",
      [
        {
          text: "Cancel"
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {

            /* REMOVE FROM HISTORY */

            await deletePromptFromHistory(id);

            setHistoryData(prev =>
              prev.filter(item =>
                item.id !== id
              )
            );

            /* REMOVE FROM FOLDERS */

            try {

              const data =
                await AsyncStorage.getItem(
                  "FOLDER_PROMPTS"
                );

              const parsed =
                data ? JSON.parse(data) : {};

              Object.keys(parsed).forEach(
                folderId => {

                  parsed[folderId] =
                    parsed[folderId].filter(
                      item => item.id !== id
                    );

                }
              );

              await AsyncStorage.setItem(
                "FOLDER_PROMPTS",
                JSON.stringify(parsed)
              );

            } catch (e) {

              console.log(e);

            }

          }
        }
      ]
    );

  };

  /* REUSE */
  const handleReuse = (item) => {
    navigation.navigate("Create", {
      prompt: item.prompt,
      type: item.category
    });
  };

  const handleAddToFolder = (item) => {

    setSelectedPrompt(item);

    setFolderModal(true);

  };




  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>

      <Header />

      <FlatList
        data={historyData}
        keyExtractor={(item) =>
          item.id.toString()
        }
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <>
            {/* Heading */}
            <Text
              style={{
                fontSize: 36,
                fontWeight: '900',
                color: theme.primary,
                marginBottom: 24
              }}
            >
              History
            </Text>
          </>
        }
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              marginTop: 80
            }}
          >

            <Ionicons
              name="time-outline"
              size={60}
              color={theme.border}
            />

            <Text
              style={{
                color: theme.subText,
                marginTop: 12
              }}
            >
              No history yet
            </Text>

          </View>
        }
        renderItem={({ item }) => (

          <HistoryCard
            item={item}
            onDelete={handleDelete}
            onCopy={handleCopy}
            onAddToFolder={
              handleAddToFolder
            }
            onReuse={handleReuse}
            theme={theme}
          />

        )}
      />

      {/* FOLDER MODAL */}
      <Modal
        transparent
        visible={folderModal}
        animationType="fade"
      >

        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 20,
          }}
        >

          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 20,
            }}
          >

            <Text
              style={{
                color: theme.text,
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 20,
              }}
            >
              Select Folder
            </Text>

            {
              folders.map(folder => (

                <TouchableOpacity
                  key={folder.id}
                  onPress={() =>
                    selectFolder(folder)
                  }
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                >

                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 16,
                    }}
                  >
                    {folder.title}
                  </Text>

                </TouchableOpacity>

              ))
            }

            <TouchableOpacity
              onPress={() =>
                setFolderModal(false)
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





    </View>
  );
}