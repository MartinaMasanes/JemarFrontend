import { useState, useEffect, useCallback } from "react";

import { AuthContext } from "./AuthContext";
import { IsTokenValid } from "../protected/Protected.helpers";
import { API_URL } from "../../api/config";
import { apiFetch } from "../../api/httpClient";

const decodeJWT = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error("Token inválido:", error);
    return null;
  }
};

const getInitialRole = () => {
  const storedRole = localStorage.getItem("role");
  if (storedRole) return storedRole;

  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = decodeJWT(token);
  return decoded?.role || null;
};

const getInitialToken = () => localStorage.getItem("token");

const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState(getInitialToken());
  const [role, setRole] = useState(getInitialRole());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token && !IsTokenValid(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setToken(null);
      setRole(null);
    }
  }, [token]);

  const loadUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await apiFetch("/api/auth/me");
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = await response.json();
      setUser({ ...data, name: data.firstName });
    } catch (error) {
      console.error("Error cargando el perfil:", error);
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogin = (token, role) => {
    setToken(token);
    setRole(role);
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <>
      <AuthContext.Provider
        value={{
          token,
          role,
          user,
          onLogin: handleLogin,
          onLogout: handleLogout,
          refreshUser: loadUser,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};

export default AuthContextProvider;