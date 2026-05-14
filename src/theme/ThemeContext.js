import React, {
    createContext,
    useState,
    useMemo,
    useCallback
} from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme } from "./theme";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
    const systemTheme = useColorScheme();

    const [themeMode, setThemeMode] = useState("system");

    const changeTheme =
        useCallback((mode) => {

            setThemeMode(mode);

        }, []);



    const theme = useMemo(() => {

        return themeMode === "system"
            ? systemTheme === "dark"
                ? darkTheme
                : lightTheme
            : themeMode === "dark"
                ? darkTheme
                : lightTheme;

    }, [themeMode, systemTheme]);

    const contextValue = useMemo(() => ({

        theme,
        themeMode,
        setThemeMode: changeTheme,

    }), [theme, themeMode, changeTheme]);


    return (
        <ThemeContext.Provider
            value={contextValue}
        >
            {children}
        </ThemeContext.Provider>
    );
}