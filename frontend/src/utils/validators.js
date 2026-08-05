export const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const validateName = (value) =>
  /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/.test(value.trim());

export const validatePassword = (value) =>
  /^[A-Za-z\d]{8,}$/.test(value.trim());
