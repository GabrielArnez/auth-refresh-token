import React, { createContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../services/api";

import { setCookie, parseCookies, destroyCookie } from "nookies";

type AuthProviderProps = {
  children: ReactNode;
};

type SignInCredentials = {
  email: string;
  password: string;
};

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User;
};

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  destroyCookie(undefined, "nextauth.token");
  destroyCookie(undefined, "nextauth.refreshToken");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User>({} as User);
  const isAuthenticated = !!user;

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();
    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles });
        })
        .catch(() => {
          destroyCookie(undefined, "nextauth.token");
          destroyCookie(undefined, "nextauth.refreshToken");
        });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post("/sessions", {
        email: email,
        password: password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      setUser({
        email,
        permissions,
        roles,
      });

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      setCookie(undefined, "nextauth.refreshtoken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      router.push("/dashboard");
    } catch (err) {
      signOut();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signIn,
        isAuthenticated,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
