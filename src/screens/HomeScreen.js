import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import AnimatedToggle from "../components/AnimatedToggle";
import { useRoute } from "@react-navigation/native";
import { ThemeContext } from "../theme/ThemeContext";
import * as Clipboard from 'expo-clipboard';
import { savePromptToHistory } from "../storage/historyStorage";
export default function HomeScreen() {
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  /* USER PLAN */
  const isPremiumUser = false;
  const route = useRoute();
  const { theme } = useContext(ThemeContext);

  /* INPUT */
  const [input, setInput] = useState("");

  /* AUTO FILL FROM HISTORY */
  useEffect(() => {
    if (route.params?.prompt) {
      setInput(route.params.prompt);
    }
  }, [route.params?.prompt]);

  /* MAIN STATES */
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [selectedQuality, setSelectedQuality] = useState('Standard');
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [promptType, setPromptType] = useState("Image");

  /* TEXT */
  const [contentLength, setContentLength] = useState("Short");
  const [tone, setTone] = useState("Casual");

  /* VIDEO */
  const [camera, setCamera] = useState("Static");
  const [faceLock, setFaceLock] = useState(false);

  /* RESET INPUT ON TYPE CHANGE */
  useEffect(() => {
    setInput("");
  }, [promptType]);

  /* GENERATE */
  const handleGenerate = () => {

    if (!input.trim()) {
      Alert.alert("Error", "Please enter your idea first");
      return;
    }

    let finalPrompt = "";

    if (promptType === "Image") {

      finalPrompt =
        `${selectedStyle} ${selectedQuality} quality ${aspectRatio} aspect ratio image of ${input}`;

    } else if (promptType === "Text") {

      finalPrompt =
        `${tone} ${contentLength} content about ${input}`;

    } else if (promptType === "Video") {

      finalPrompt =
        `${camera} cinematic video of ${input} with face consistency ${faceLock ? "enabled" : "disabled"}`;

    }

    setGeneratedPrompt(finalPrompt);

    const newHistoryItem = {
      id: Date.now().toString(),
      time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      category: promptType,
      prompt: finalPrompt,
      input: input
    };

    savePromptToHistory(newHistoryItem);
  };


  const copyPrompt = async () => {
    await Clipboard.setStringAsync(generatedPrompt);
    Alert.alert("Copied", "Prompt copied successfully");
  };

  const LockBadge = () => (







    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f59e0b20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        marginLeft: 10,
      }}
    >

      <Ionicons
        name="lock-closed"
        size={12}
        color="#f59e0b"
      />

      <Text
        style={{
          color: '#f59e0b',
          fontSize: 11,
          fontWeight: 'bold',
          marginLeft: 4,
        }}
      >
        FREE USER
      </Text>

    </View>

  );







  const promptTypes = ["Image", "Text", "Video"];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>

      <Header />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADING */}
        <View style={{ marginBottom: 32, marginTop: 8 }}>
          <Text style={{ fontSize: 40, fontWeight: '900', color: theme.text }}>
            Turn ideas into{"\n"}powerful{"\n"}prompts
          </Text>
        </View>

        {/* PROMPT TYPE */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.subText, marginBottom: 12, textTransform: 'uppercase' }}>
            SELECT PROMPT TYPE
          </Text>

          <View style={{ backgroundColor: theme.border, borderRadius: 999, flexDirection: 'row', padding: 4 }}>
            {promptTypes.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setPromptType(item)}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: 'center', backgroundColor: promptType === item ? theme.card : 'transparent' }}
              >
                <Text style={{ fontWeight: promptType === item ? 'bold' : 'normal', color: promptType === item ? theme.primary : theme.subText }}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* INPUT */}
        <View style={{ backgroundColor: theme.card, padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: theme.border }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={
              promptType === "Video"
                ? "Enter your video idea..."
                : promptType === "Text"
                  ? "Enter your text content idea..."
                  : "Enter your image idea..."
            }
            placeholderTextColor={theme.subText}
            multiline
            style={{ color: theme.text, fontSize: 16, height: 128 }}
            textAlignVertical="top"
          />
        </View>




        {/* IMAGE UI */}
        {promptType === "Image" && (
          <>

            {/* QUALITY */}
            <View style={{ marginBottom: 16 }}>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >

                <Text
                  style={{
                    color: theme.subText,
                    fontWeight: 'bold',
                    fontSize: 12,
                  }}
                >
                  QUALITY
                </Text>

                {!isPremiumUser && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >

                    <Ionicons
                      name="lock-closed"
                      size={14}
                      color="#f59e0b"
                    />

                    <Text
                      style={{
                        color: '#f59e0b',
                        marginLeft: 4,
                        fontSize: 11,
                        fontWeight: 'bold',
                      }}
                    >
                      FREE USER
                    </Text>

                  </View>
                )}

              </View>

              <AnimatedToggle
                options={["Standard", "High"]}
                value={selectedQuality}
                onChange={(value) => {

                  if (
                    value === "High" &&
                    !isPremiumUser
                  ) {

                    Alert.alert(
                      "Premium Feature",
                      "High quality is locked for free users."
                    );

                    return;
                  }

                  setSelectedQuality(value);

                }}
              />

            </View>

            {/* STYLE */}
            <View style={{ marginBottom: 16 }}>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >

                <Text
                  style={{
                    color: theme.subText,
                    fontWeight: 'bold',
                    fontSize: 12,
                  }}
                >
                  STYLE
                </Text>

                {!isPremiumUser && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >

                    <Ionicons
                      name="lock-closed"
                      size={14}
                      color="#f59e0b"
                    />

                    <Text
                      style={{
                        color: '#f59e0b',
                        marginLeft: 4,
                        fontSize: 11,
                        fontWeight: 'bold',
                      }}
                    >
                      FREE USER
                    </Text>

                  </View>
                )}

              </View>

              <AnimatedToggle
                options={["Realistic", "Artistic"]}
                value={selectedStyle}
                onChange={(value) => {

                  if (
                    value === "Artistic" &&
                    !isPremiumUser
                  ) {

                    Alert.alert(
                      "Premium Feature",
                      "Artistic style is locked for free users."
                    );

                    return;
                  }

                  setSelectedStyle(value);

                }}
              />

            </View>

            {/* ASPECT RATIO */}
            <AnimatedToggle
              label="ASPECT RATIO"
              options={[
                "1:1",
                "16:9",
                "9:16",
                "4:5",
                "3:2"
              ]}
              value={aspectRatio}
              onChange={setAspectRatio}
            />

          </>
        )}

        {/* TEXT UI */}
        {promptType === "Text" && (
          <>

            {/* CONTENT LENGTH */}
            <View style={{ marginBottom: 16 }}>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >

                <Text
                  style={{
                    color: theme.subText,
                    fontWeight: 'bold',
                    fontSize: 12,
                  }}
                >
                  CONTENT LENGTH
                </Text>

                {!isPremiumUser && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >

                    <Ionicons
                      name="lock-closed"
                      size={14}
                      color="#f59e0b"
                    />

                    <Text
                      style={{
                        color: '#f59e0b',
                        marginLeft: 4,
                        fontSize: 11,
                        fontWeight: 'bold',
                      }}
                    >
                      FREE USER
                    </Text>

                  </View>
                )}

              </View>

              <AnimatedToggle
                options={["Short", "Medium", "Long"]}
                value={contentLength}
                onChange={(value) => {

                  if (
                    value === "Long" &&
                    !isPremiumUser
                  ) {

                    Alert.alert(
                      "Premium Feature",
                      "Long content is locked for free users."
                    );

                    return;
                  }

                  setContentLength(value);

                }}
              />

            </View>

            {/* TONE */}
            <View style={{ marginBottom: 16 }}>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >

                <Text
                  style={{
                    color: theme.subText,
                    fontWeight: 'bold',
                    fontSize: 12,
                  }}
                >
                  TONE
                </Text>

                {!isPremiumUser && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >

                    <Ionicons
                      name="lock-closed"
                      size={14}
                      color="#f59e0b"
                    />

                    <Text
                      style={{
                        color: '#f59e0b',
                        marginLeft: 4,
                        fontSize: 11,
                        fontWeight: 'bold',
                      }}
                    >
                      FREE USER
                    </Text>

                  </View>
                )}

              </View>

              <AnimatedToggle
                options={["Casual", "Professional", "Creative"]}
                value={tone}
                onChange={(value) => {

                  if (
                    (
                      value === "Professional" ||
                      value === "Creative"
                    ) &&
                    !isPremiumUser
                  ) {

                    Alert.alert(
                      "Premium Feature",
                      "This tone is locked for free users."
                    );

                    return;
                  }

                  setTone(value);

                }}
              />

            </View>

          </>
        )}

        {/* VIDEO UI */}
        {promptType === "Video" && (
          <>

            {/* CAMERA */}
            <View style={{ marginBottom: 16 }}>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >

                <Text
                  style={{
                    color: theme.subText,
                    fontWeight: 'bold',
                    fontSize: 12,
                  }}
                >
                  CAMERA
                </Text>

                {!isPremiumUser && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >

                    <Ionicons
                      name="lock-closed"
                      size={14}
                      color="#f59e0b"
                    />

                    <Text
                      style={{
                        color: '#f59e0b',
                        marginLeft: 4,
                        fontSize: 11,
                        fontWeight: 'bold',
                      }}
                    >
                      FREE USER
                    </Text>

                  </View>
                )}

              </View>

              <AnimatedToggle
                options={["Static", "Zoom", "Pan", "Drone"]}
                value={camera}
                onChange={(value) => {

                  if (
                    value !== "Static" &&
                    !isPremiumUser
                  ) {

                    Alert.alert(
                      "Premium Feature",
                      "Advanced camera controls are locked for free users."
                    );

                    return;
                  }

                  setCamera(value);

                }}
              />

            </View>

            {/* FACE CONSISTENCY */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >

              {/* LEFT */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >

                <Ionicons
                  name="lock-closed"
                  size={22}
                  color="#f59e0b"
                />

                <Text
                  style={{
                    marginLeft: 12,
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                >
                  Face Consistency
                </Text>

              </View>

              {/* TOGGLE */}
              <TouchableOpacity
                onPress={() => {

                  if (!isPremiumUser) {

                    Alert.alert(
                      "Premium Feature",
                      "Face consistency is locked for free users."
                    );

                    return;
                  }

                  setFaceLock(!faceLock);

                }}
                activeOpacity={0.8}
                style={{
                  width: 52,
                  height: 28,
                  borderRadius: 999,
                  backgroundColor: faceLock
                    ? "#22c55e"
                    : "#d1d5db",

                  justifyContent: "center",
                  paddingHorizontal: 3,
                }}
              >

                {/* CIRCLE */}
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: "white",
                    alignSelf: faceLock
                      ? "flex-end"
                      : "flex-start",
                  }}
                />

              </TouchableOpacity>

            </View>

          </>
        )}









        {/* GENERATE BUTTON */}
        <TouchableOpacity
          onPress={handleGenerate}
          style={{
            backgroundColor: theme.primary,
            paddingVertical: 16,
            borderRadius: 999,
            marginTop: 24,
            alignItems: 'center'
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 18
            }}
          >
            Generate Prompt
          </Text>
        </TouchableOpacity>

        {/* GENERATED PROMPT BOX */}
        {
          generatedPrompt ? (

            <View
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 24,
                padding: 20,
                marginTop: 24,
              }}
            >

              <Text
                style={{
                  color: theme.primary,
                  fontWeight: 'bold',
                  marginBottom: 12,
                  fontSize: 16,
                }}
              >
                Generated Prompt
              </Text>

              <Text
                style={{
                  color: theme.text,
                  lineHeight: 24,
                  fontSize: 15,
                }}
              >
                {generatedPrompt}
              </Text>

              {/* COPY BUTTON */}
              <TouchableOpacity
                onPress={copyPrompt}
                style={{
                  backgroundColor: theme.primary,
                  paddingVertical: 12,
                  borderRadius: 14,
                  marginTop: 20,
                  alignItems: 'center',
                }}
              >

                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  Copy Prompt
                </Text>

              </TouchableOpacity>

            </View>

          ) : null
        }





      </ScrollView>
    </View>
  );
}