import React, {
  useContext,
  useMemo
} from 'react';

import {
  createBottomTabNavigator
} from '@react-navigation/bottom-tabs';

import {
  Ionicons
} from '@expo/vector-icons';

import {
  ThemeContext
} from '../theme/ThemeContext';

/* SCREENS */
import HomeScreen
  from '../screens/HomeScreen';

import HistoryScreen
  from '../screens/HistoryScreen';

import LibraryScreen
  from '../screens/LibraryScreen';

import PremiumScreen
  from '../screens/PremiumScreen';

const Tab =
  createBottomTabNavigator();

export default function TabNavigator() {

  const { theme } =
    useContext(ThemeContext);

  /* 🔥 PERFORMANCE */
  const screenOptions = useMemo(() => ({

    headerShown: false,

    /* 🔥 FREEZE UNUSED SCREENS */
    freezeOnBlur: true,

    /* 🔥 TAB COLORS */
    tabBarActiveTintColor:
      theme.primary,

    tabBarInactiveTintColor:
      theme.subText,

    /* 🔥 TAB DESIGN */
    tabBarStyle: {
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      elevation: 0,
      height: 65,
      paddingBottom: 10,
      paddingTop: 10,
    },

  }), [theme]);

  return (

    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: theme.background }}
      screenOptions={({ route }) => ({

        ...screenOptions,

        /* 🔥 ICONS */
        tabBarIcon: ({
          focused,
          color
        }) => {

          let iconName;

          if (route.name === 'Create') {

            iconName = focused
              ? 'add-circle'
              : 'add-circle-outline';

          } else if (
            route.name === 'History'
          ) {

            iconName = focused
              ? 'time'
              : 'time-outline';

          } else if (
            route.name === 'Library'
          ) {

            iconName = focused
              ? 'grid'
              : 'grid-outline';

          } else if (
            route.name === 'Premium'
          ) {

            iconName = focused
              ? 'ribbon'
              : 'ribbon-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={26}
              color={color}
            />
          );
        },

      })}
    >

      <Tab.Screen
        name="Create"
        component={HomeScreen}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
      />

      <Tab.Screen
        name="Library"
        component={LibraryScreen}
      />

      <Tab.Screen
        name="Premium"
        component={PremiumScreen}
      />

    </Tab.Navigator>
  );
}