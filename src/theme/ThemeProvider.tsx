import { App as AntdApp, ConfigProvider, theme as antdTheme } from "antd";
import zhCN from "antd/locale/zh_CN";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { PRIMARY, mixHex, withAlpha } from "./color";

export type ThemeScheme = "light" | "dark";

type ThemeContextValue = {
  scheme: ThemeScheme;
  darkMode: boolean;
  toggleScheme: () => void;
};

const STORAGE_KEY = "spark_admin_theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

function readScheme(): ThemeScheme {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<ThemeScheme>(readScheme);
  const darkMode = scheme === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = scheme;
    localStorage.setItem(STORAGE_KEY, scheme);
  }, [scheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      darkMode,
      toggleScheme: () => setScheme((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [scheme, darkMode],
  );

  const container = darkMode ? "#1a1f26" : "#ffffff";
  const layout = darkMode ? "#0f1419" : "#f0f4f8";

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: darkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: PRIMARY,
            colorInfo: "#0ea5e9",
            colorSuccess: "#10b981",
            colorWarning: "#f59e0b",
            colorError: "#f43f5e",
            colorBgContainer: container,
            colorBgLayout: layout,
            borderRadius: 8,
            fontSize: 14,
            controlHeight: 36,
            fontFamily:
              '"Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
          },
          components: {
            Layout: {
              headerBg: container,
              siderBg: container,
              bodyBg: layout,
            },
            Menu: {
              itemBg: "transparent",
              itemMarginInline: 8,
              itemSelectedBg: withAlpha(PRIMARY, darkMode ? 0.22 : 0.1),
              itemSelectedColor: PRIMARY,
              activeBarBorderWidth: 0,
            },
            Card: {
              paddingLG: 16,
            },
            Button: {
              controlHeightSM: 28,
            },
            Modal: {
              borderRadiusLG: 13,
            },
          },
        }}
      >
        <AntdApp
          style={
            {
              height: "100%",
              ["--spark-primary" as string]: PRIMARY,
              ["--spark-primary-soft" as string]: withAlpha(PRIMARY, darkMode ? 0.22 : 0.12),
              ["--spark-login-bg" as string]: mixHex("#ffffff", PRIMARY, darkMode ? 0.5 : 0.2),
            } as CSSProperties
          }
        >
          {children}
        </AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
