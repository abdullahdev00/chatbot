import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  token: string | null;
  conversationId: string | null;
  login: (phoneNumber: string, name?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on app start
    const storedUser = localStorage.getItem("medichat_user");
    const storedToken = localStorage.getItem("medichat_token");
    const storedConversationId = localStorage.getItem("medichat_conversation");

    if (storedUser && storedToken && storedConversationId) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setConversationId(storedConversationId);
      } catch (error) {
        console.error("Failed to restore auth state:", error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (phoneNumber: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, name }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        setConversationId(data.conversationId);

        // Store in localStorage
        localStorage.setItem("medichat_user", JSON.stringify(data.user));
        localStorage.setItem("medichat_token", data.token);
        localStorage.setItem("medichat_conversation", data.conversationId);

        return true;
      } else {
        const error = await response.json();
        console.error("Login failed:", error);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear state and localStorage
    setUser(null);
    setToken(null);
    setConversationId(null);
    localStorage.removeItem("medichat_user");
    localStorage.removeItem("medichat_token");
    localStorage.removeItem("medichat_conversation");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        conversationId,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};