// src/utils/validators.js
// Reglas de validación puras (sin React, sin datos). Las usan los servicios y,
// en la Fase C, los formularios, para que la regla sea UNA sola.

export const INSTITUTIONAL_DOMAIN = '@ulima.edu.pe';

/** Texto único de requisitos de contraseña (registro, perfil y recuperación). */
export const PASSWORD_REQUIREMENTS_TEXT =
  'Mínimo 8 caracteres, una mayúscula y un número.';

const BASIC_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value) => BASIC_EMAIL.test(String(value ?? '').trim());

export const isInstitutionalEmail = (value) =>
  isValidEmail(value) &&
  String(value).trim().toLowerCase().endsWith(INSTITUTIONAL_DOMAIN);

/** Cada regla con su estado, para pintar "Cumple los 8 caracteres y una mayúscula". */
export const passwordRules = (password) => {
  const value = String(password ?? '');
  return [
    { id: 'length', label: '8 caracteres', ok: value.length >= 8 },
    { id: 'uppercase', label: 'una mayúscula', ok: /[A-ZÁÉÍÓÚÑ]/.test(value) },
    { id: 'number', label: 'un número', ok: /\d/.test(value) },
  ];
};

export const isPasswordValid = (password) =>
  passwordRules(password).every((rule) => rule.ok);

export const passwordsMatch = (password, confirmation) =>
  password === confirmation;

export const isBlank = (value) => String(value ?? '').trim() === '';