import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi } from "../services/sigethApi";

interface User {
  id: string;
  username: string;
  name: string;
  level: string;
  submodule: string;
}

export type AuthUser = User;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapSession = async () => {
      const accessToken = localStorage.getItem("access_token");
      const stored = localStorage.getItem("sigeth_user");

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.me();
        const sessionUser: User = {
          id: String(profile.id),
          username: profile.username,
          name: profile.full_name,
          level: profile.level,
          submodule:
            profile.level === "Manager_R"
              ? "rooms-attendant"
              : profile.level === "Manager_H"
                ? "housekeeping"
                : profile.level === "Manager_B"
                  ? "banqueting"
                  : profile.module_access,
        };
        localStorage.setItem("sigeth_user", JSON.stringify(sessionUser));
        setUser(sessionUser);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (stored) {
          localStorage.removeItem("sigeth_user");
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrapSession();
  }, []);

  const login = async (username: string, password: string) => {
    const tokens = await authApi.login(username, password);
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);

    const profile = await authApi.me();
    const sessionUser: User = {
      id: String(profile.id),
      username: profile.username,
      name: profile.full_name,
      level: profile.level,
      submodule:
        profile.level === "Manager_R"
          ? "rooms-attendant"
          : profile.level === "Manager_H"
            ? "housekeeping"
            : profile.level === "Manager_B"
              ? "banqueting"
              : profile.module_access,
    };

    localStorage.setItem("sigeth_user", JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  };

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined);
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("sigeth_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
