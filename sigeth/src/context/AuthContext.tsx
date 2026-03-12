import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { mockUsers } from "../utils/mockData";

interface User {
  username: string;
  name: string;
  level: string;
  submodule: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sigeth_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const found = mockUsers.find(
      (u) => u.username === username && u.password === password,
    );
    if (!found) throw new Error("Invalid credentials");
    const u: User = {
      username: found.username,
      name: found.name,
      level: found.level,
      submodule: found.submodule,
    };
    localStorage.setItem("sigeth_user", JSON.stringify(u));
    setUser(u);
  };

  const logout = useCallback(() => {
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
