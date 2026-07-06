import { jwtDecode } from "jwt-decode";

export const IsTokenValid = (token) => {
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);

    if (!decodedToken.exp || !decodedToken.role) return false;

    const currentTime = Date.now() / 1000;
    return currentTime < decodedToken.exp;
  } catch (error) {
    console.error("Error decodificando el token:", error);
    return false;
  }
};
