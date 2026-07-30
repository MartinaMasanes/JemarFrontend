import { useState, useEffect } from "react";

import { AuthContext } from "./AuthContext";
import { IsTokenValid } from "../protected/Protected.helpers";
import { API_URL } from "../../api/config";

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
  useEffect(() => {
    if (token && !IsTokenValid(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setToken(null);
      setRole(null);
    }
  }, [token]);

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
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <>
      <AuthContext.Provider
        value={{
          token,
          role,
          onLogin: handleLogin,
          onLogout: handleLogout,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};

export default AuthContextProvider;