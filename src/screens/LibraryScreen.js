import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from "../theme/ThemeContext";
import { useNavigation } from "@react-navigation/native";

import { saveFolders, getFolders } from "../storage/folderStorage";



const FolderCard = ({ item, onDelete, onRename, theme }) => {

  const navigation = useNavigation();

  return (

    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Folder", {
          folder: item
        })
      }
      style={{
        backgroundColor: theme.card,
        padding: 16,
        borderRadius: 16,
        width: '48%',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border
      }}
    >

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Ionicons name="folder-outline" size={24} color={theme.primary} />

        <TouchableOpacity onPress={() => onDelete(item)}>
          <Ionicons name="trash-outline" size={18} color={theme.subText} />
        </TouchableOpacity>
      </View>

      <Text style={{ color: theme.text, fontWeight: 'bold', marginTop: 12 }}>
        {item.title}
      </Text>

      <TouchableOpacity
        onPress={() => onRename(item)}
        style={{ marginTop: 8 }}
      >
        <Text
          style={{
            color: '#3b82f6',
            fontSize: 12,
            fontWeight: '600'
          }}
        >
          Rename
        </Text>
      </TouchableOpacity>

    </TouchableOpacity>

  );
};

export default function LibraryScreen() {

  const { theme } = useContext(ThemeContext);

  const [folders, setFolders] = useState([]);
  const [newFolder, setNewFolder] = useState("");

  const [renameModal, setRenameModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [renameText, setRenameText] = useState("");

  useEffect(() => {

    loadFolders();

  }, []);

  const loadFolders = async () => {

    const savedFolders =
      await getFolders();

    setFolders(savedFolders);

  };

  const addFolder = () => {
    if (!newFolder.trim()) {
      Alert.alert("Missing Name", "Please enter folder name");
      return;
    }

    const exists = folders.some(
      f => f.title.toLowerCase() === newFolder.toLowerCase()
    );

    if (exists) {
      Alert.alert("Duplicate", "Folder already exists");
      return;
    }

    const updatedFolders = [
      ...folders,
      {
        id: Date.now().toString(),
        title: newFolder
      }
    ];

    setFolders(updatedFolders);

    saveFolders(updatedFolders);

    setNewFolder("");
  };

  const openRename = (item) => {
    setSelectedFolder(item);
    setRenameText(item.title);
    setRenameModal(true);
  };

  const saveRename = () => {
    const updated = folders.map(f =>
      f.id === selectedFolder.id ? { ...f, title: renameText } : f
    );
    setFolders(updated);
    saveFolders(updated);
    setRenameModal(false);
  };

  const openDelete = (item) => {
    setSelectedFolder(item);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    const updated = folders.filter(f => f.id !== selectedFolder.id);
    setFolders(updated);
    saveFolders(updated);
    setDeleteModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>

      <Header />

      <FlatList
        data={folders}
        keyExtractor={(item) =>
          item.id.toString()
        }
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          justifyContent: 'space-between',
        }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}

        ListHeaderComponent={
          <>
            {/* HEADING */}
            <Text
              style={{
                fontSize: 36,
                fontWeight: '900',
                color: theme.primary,
                marginBottom: 24,
              }}
            >
              Library
            </Text>

            {/* CREATE FOLDER */}
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 24,
              }}
            >

              <TextInput
                placeholder="Create folder..."
                placeholderTextColor={
                  theme.subText
                }
                value={newFolder}
                onChangeText={setNewFolder}
                style={{
                  flex: 1,
                  backgroundColor: theme.card,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />

              <TouchableOpacity
                onPress={addFolder}
                style={{
                  marginLeft: 8,
                  backgroundColor:
                    theme.primary,
                  paddingHorizontal: 16,
                  justifyContent: 'center',
                  borderRadius: 12,
                }}
              >

                <Ionicons
                  name="add"
                  size={24}
                  color="white"
                />

              </TouchableOpacity>

            </View>
          </>
        }

        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              marginTop: 80,
            }}
          >

            <Ionicons
              name="folder-open-outline"
              size={70}
              color={theme.border}
            />

            <Text
              style={{
                color: theme.text,
                fontSize: 22,
                fontWeight: 'bold',
                marginTop: 16,
              }}
            >
              No Folders Yet
            </Text>

            <Text
              style={{
                color: theme.subText,
                marginTop: 8,
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              Create folders to organize
              your prompts beautifully.
            </Text>

          </View>
        }

        renderItem={({ item }) => (

          <FolderCard
            item={item}
            onDelete={openDelete}
            onRename={openRename}
            theme={theme}
          />

        )}
      />

      {/* 🔥 RENAME MODAL */}
      <Modal transparent visible={renameModal} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.card, padding: 24, borderRadius: 16, width: '80%', borderWidth: 1, borderColor: theme.border }}>

            <Text style={{ fontWeight: 'bold', color: theme.text, marginBottom: 12, fontSize: 18 }}>Rename Folder</Text>

            <TextInput
              value={renameText}
              onChangeText={setRenameText}
              style={{ borderWidth: 1, borderColor: theme.border, color: theme.text, padding: 12, borderRadius: 12, marginBottom: 16 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setRenameModal(false)}>
                <Text style={{ marginRight: 24, color: theme.subText, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={saveRename}>
                <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* 🔥 DELETE MODAL */}
      <Modal transparent visible={deleteModal} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.card, padding: 24, borderRadius: 16, width: '80%', borderWidth: 1, borderColor: theme.border }}>

            <Text style={{ fontWeight: 'bold', color: theme.text, marginBottom: 16, fontSize: 18 }}>Delete this folder?</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setDeleteModal(false)}>
                <Text style={{ marginRight: 24, color: theme.subText, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={confirmDelete}>
                <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}