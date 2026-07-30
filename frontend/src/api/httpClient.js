import { API_URL } from "./config";

let refreshPromise = null;

const buildHeaders = (headers) => {
  const token = localStorage.getItem("token");
  const merged = { ...(headers || {}) };
  if (token) merged.Authorization = `Bearer ${token}`;
  return merged;
};

const doRefresh = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (!data.token) return false;

    localStorage.setItem("token", data.token);
    if (data.role) localStorage.setItem("role", data.role);
    return true;
  } catch (error) {
    console.error("Refresh error:", error);
    return false;
  }
};

const refreshOnce = () => {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const clearSessionAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/notLogged";
};

export const apiFetch = async (path, options = {}) => {
  const { _retried, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: buildHeaders(headers),
  });

  if (response.status !== 401 || _retried) return response;

  const refreshed = await refreshOnce();
  if (!refreshed) {
    clearSessionAndRedirect();
    return response;
  }

  return apiFetch(path, { ...options, _retried: true });
};
