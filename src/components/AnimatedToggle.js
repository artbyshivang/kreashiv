import React, {
  useRef,
  useState,
  useContext,
  useEffect
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";

import { Ionicons }
  from "@expo/vector-icons";

import {
  ThemeContext
} from "../theme/ThemeContext";

export default function AnimatedToggle({

  label,

  options = [],

  value,

  onChange,

}) {

  const { theme } =
    useContext(ThemeContext);

  const translateX =
    useRef(
      new Animated.Value(0)
    ).current;

  const [containerWidth,
    setContainerWidth
  ] = useState(0);

  const PADDING = 6;

  const INNER_WIDTH =
    containerWidth - PADDING * 2;

  const optionWidth =
    INNER_WIDTH / options.length;

  /* SELECTED INDEX */
  const selectedIndex =
    options.findIndex(
      item =>
        (item.value || item) === value
    );

  /* SLIDE ANIMATION */
  useEffect(() => {

    Animated.spring(
      translateX,
      {
        toValue:
          selectedIndex >= 0
            ? selectedIndex
            : 0,

        useNativeDriver: true,
      }
    ).start();

  }, [value]);

  const translate =
    translateX.interpolate({

      inputRange:
        options.map((_, i) => i),

      outputRange:
        options.map(
          (_, i) => i * optionWidth
        ),

    });

  return (

    <View
      style={{
        marginBottom: 24
      }}
    >

      <View
        style={{
          backgroundColor:
            theme.card,

          padding: 24,

          borderRadius: 16,

          borderWidth: 1,

          borderColor:
            theme.border,
        }}
      >

        {/* LABEL */}
        {
          label && (

            <Text
              style={{
                color: theme.subText,
                fontSize: 12,
                fontWeight: 'bold',
                textTransform:
                  'uppercase',

                letterSpacing: 1,

                marginBottom: 12,
              }}
            >
              {label}
            </Text>

          )
        }

        {/* TOGGLE */}
        <View
          onLayout={(e) =>
            setContainerWidth(
              e.nativeEvent.layout.width
            )
          }

          style={{
            backgroundColor:
              theme.background,

            borderRadius: 999,

            flexDirection: 'row',

            padding: 6,

            alignItems: 'center',

            position: 'relative',

            overflow: 'hidden',
          }}
        >

          {/* ACTIVE SLIDER */}
          {
            containerWidth > 0 && (

              <Animated.View
                style={{
                  position: "absolute",

                  top: PADDING,

                  left: PADDING,

                  width: optionWidth,

                  height: "100%",

                  borderRadius: 999,

                  backgroundColor:
                    theme.card,

                  transform: [
                    {
                      translateX:
                        translate
                    }
                  ],
                }}
              />

            )
          }

          {/* OPTIONS */}
          {
            options.map(
              (item, index) => {

                const label =
                  item.label || item;

                const itemValue =
                  item.value || item;

                const locked =
                  item.locked;

                const isSelected =
                  value === itemValue;

                return (

                  <TouchableOpacity
                    key={index}

                    disabled={locked}

                    activeOpacity={
                      locked ? 1 : 0.8
                    }

                    onPress={() => {

                      if (locked) {
                        return;
                      }

                      onChange &&
                        onChange(
                          itemValue
                        );

                    }}

                    style={{
                      flex: 1,

                      paddingVertical: 14,

                      alignItems: 'center',

                      opacity:
                        locked
                          ? 0.45
                          : 1,
                    }}
                  >

                    <View
                      style={{
                        flexDirection:
                          'row',

                        alignItems:
                          'center',
                      }}
                    >

                      <Text
                        style={{
                          fontSize: 14,

                          fontWeight:
                            isSelected
                              ? 'bold'
                              : '600',

                          color:
                            isSelected
                              ? theme.text
                              : theme.subText,
                        }}
                      >
                        {label}
                      </Text>

                      {
                        locked && (

                          <Ionicons
                            name="lock-closed"
                            size={12}
                            color="#f59e0b"
                            style={{
                              marginLeft: 4,
                            }}
                          />

                        )
                      }

                    </View>

                  </TouchableOpacity>

                );
              }
            )
          }

        </View>

      </View>

    </View>
  );
}