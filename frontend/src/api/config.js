// URL base del backend. Se resuelve en tiempo de build desde VITE_API_URL
// (ver .env). Si no está definida, usa el backend local por defecto.
//
// Nota: el backend por defecto (`dotnet run`, perfil http) escucha en
// http://localhost:5186. Si corrés el perfil https, usá
// https://localhost:7098 y confiá el certificado con `dotnet dev-certs https --trust`.
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5186";
