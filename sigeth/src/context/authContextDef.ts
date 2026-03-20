import { createContext } from "react";

interface User {
  id: string;
  username: string;
  name: string;
  level: string;
  submodule: string;
}

export type AuthUser = User;

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
