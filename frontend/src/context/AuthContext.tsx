import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  clearToken,
  getMe,
  getToken,
  loginUser,
  registerUser,
  setToken,
  type User,
} from "../lib/api";

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Lazy-initialize from the token synchronously during render, instead of
  // resetting it to false inside the effect. If there's no token, we're
  // never "loading" in the first place, so there's nothing to synchronize.
  const [isLoading, setIsLoading] = useState(() => !!getToken());

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    getMe()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const tokenResponse = await loginUser({ email, password });
    setToken(tokenResponse.access_token);
    const me = await getMe();
    setUser(me);
  }

  async function register(name: string, email: string, password: string) {
    await registerUser({ name, email, password });
    await login(email, password);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  async function refreshUser() {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      // If refresh fails, leave user as-is
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- useAuth is consumed across many files; moving it would require updating every import site
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("context must be set");
  }
  return context;
}