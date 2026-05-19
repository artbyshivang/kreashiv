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



import { ActivityIndicator } from "react-native";
import model from "../api/gemini";
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import AnimatedToggle from "../components/AnimatedToggle";
import { useRoute } from "@react-navigation/native";
import { ThemeContext } from "../theme/ThemeContext";
import { UserContext } from "../context/UserContext";
import * as Clipboard from 'expo-clipboard';
import { savePromptToHistory } from "../storage/historyStorage";
export default function HomeScreen() {
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  /* USER PLAN */
  
  const route = useRoute();
  const { theme } = useContext(ThemeContext);


  const { user } = useContext(UserContext);

const isPremiumUser =
  user?.premium || false;

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
  const handleGenerate = async () => {

  if (!input.trim()) {

    Alert.alert(
      "Error",
      "Please enter your idea first"
    );

    return;
  }

  try {

    setLoading(true);

    let aiPrompt = "";

if (promptType === "Image") {

  aiPrompt = `
You are a professional AI image prompt engineer.

Generate a highly detailed AI image prompt.

STRICT REQUIREMENTS:
- Style: ${selectedStyle}
- Quality Level:
${selectedQuality === "High"
  ? "Ultra detailed 8K cinematic quality"
  : "Standard clean quality"}
- Aspect Ratio: ${aspectRatio}

YOU MUST STRICTLY FOLLOW:
- The selected aspect ratio
- The selected visual style
- The selected quality level

DO NOT ignore the selected settings.

If style is Artistic:
- make it stylized
- painterly
- fantasy-like
- non-photorealistic

If style is Realistic:
- make it photorealistic
- cinematic
- DSLR-like
- ultra detailed

If aspect ratio is 1:1:
- describe a square composition

If aspect ratio is 16:9:
- describe a cinematic wide landscape composition

If aspect ratio is 9:16:
- describe a vertical mobile composition

IMPORTANT:
- Include cinematic lighting
- Include camera composition
- Include realistic textures
- Include environment details
- Include color grading
- Include AI art optimized keywords
- Respect the selected aspect ratio
- Respect the selected style
- Respect the selected quality

USER IDEA:
${input}

Return ONLY the final optimized image prompt.
`;
}

else if (promptType === "Text") {

  aiPrompt = `
You are a professional content writer.

Generate a ${contentLength} ${tone} text prompt.

STRICT REQUIREMENTS:
- Tone: ${tone}
- Content Length: ${contentLength}

YOU MUST STRICTLY FOLLOW:
- The selected tone
- The selected content length

DO NOT ignore the selected settings.

If content length is Short:
- keep response concise
- maximum 2-3 sentences

If content length is Medium:
- moderate detail

If content length is Long:
- highly detailed response

If tone is Casual:
- friendly and conversational

If tone is Professional:
- formal and polished

If tone is Creative:
- imaginative and expressive

IMPORTANT:
- Make it engaging
- Make it professional
- Make it creative
- Keep the selected tone
- Keep the selected content length

USER IDEA:
${input}

Return ONLY one final optimized text prompt that strictly follows all selected settings.
`;
}

else if (promptType === "Video") {

  aiPrompt = `
You are a cinematic AI video prompt engineer.

Generate a professional cinematic video prompt.

STRICT REQUIREMENTS:
- Camera Style:
${camera === "Zoom"
  ? "cinematic zoom shot"
  : camera === "Pan"
  ? "smooth cinematic pan shot"
  : camera === "Drone"
  ? "aerial drone cinematic shot"
  : "static cinematic shot"}
- Face Consistency: ${faceLock ? "Enabled" : "Disabled"}

YOU MUST STRICTLY FOLLOW:
- The selected camera style
- Face consistency settings

DO NOT ignore the selected settings.

If camera style is Static:
- describe locked cinematic shots

If camera style is Zoom:
- describe dramatic cinematic zoom shots

If camera style is Pan:
- describe smooth horizontal cinematic movement

If camera style is Drone:
- describe aerial cinematic drone shots

If face consistency is Enabled:
- maintain the same facial identity
- preserve character consistency across all shots

If face consistency is Disabled:
- cinematic freedom is allowed






IMPORTANT:
- Include cinematic shots
- Include lighting details
- Include camera angles
- Include scene transitions
- Include motion details
- Include atmosphere details
- Make it visually cinematic
- Make it optimized for AI video generation

USER IDEA:
${input}

Return ONLY one final optimized cinematic video prompt that strictly follows all selected settings.
`;
}

    const result =
      await model.generateContent(aiPrompt);

    const response =
      await result.response;

    const text =
      response.text();

    setGeneratedPrompt(text);

    const newHistoryItem = {
      id: Date.now().toString(),
      time: new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      category: promptType,
      prompt: text,
      input: input
    };

    savePromptToHistory(newHistoryItem);

  } catch (error) {

    console.log(error);

    Alert.alert(
      "Error",
      "Failed to generate prompt"
    );

  } finally {

    setLoading(false);
  }
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
  name={
    isPremiumUser
      ? "sparkles"
      : "lock-closed"
  }
  size={22}
  color={
    isPremiumUser
      ? theme.primary
      : "#f59e0b"
  }
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
  name={
    isPremiumUser
      ? "sparkles"
      : "lock-closed"
  }
  size={22}
  color={
    isPremiumUser
      ? theme.primary
      : "#f59e0b"
  }
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
            {loading ? "Generating..." : "Generate Prompt"}
          </Text>
        </TouchableOpacity>

        {/* GENERATED PROMPT BOX */}
        {
  loading ? (

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
          marginBottom: 20,
          fontSize: 16,
        }}
      >
        Generating Prompt...
      </Text>

      {[1, 2, 3, 4, 5].map((item) => (

        <View
          key={item}
          style={{
            height: 18,
            backgroundColor: "#d1d5db",
            borderRadius: 999,
            marginBottom: 14,
            width:
              item === 2
                ? "85%"
                : item === 4
                ? "75%"
                : "100%",
            opacity: 0.7,
          }}
        />

      ))}

      <ActivityIndicator
        size="small"
        color={theme.primary}
        style={{ marginTop: 10 }}
      />

    </View>

  ) : generatedPrompt ? (

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