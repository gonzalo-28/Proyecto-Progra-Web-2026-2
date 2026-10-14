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

const joinList = (items) =>
  items.length <= 1
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;

/**
 * Resumen de las reglas de contraseña para pintar el feedback del campo.
 * successText sale de la MISMA lista que passwordRules: si la regla cambia,
 * el mensaje cambia solo ("Cumple los 8 caracteres, una mayúscula y un número.").
 */
export const describePasswordRules = (password) => {
  const rules = passwordRules(password);
  return {
    allOk: rules.every((rule) => rule.ok),
    successText: `Cumple los ${joinList(rules.map((rule) => rule.label))}.`,
  };
};

/** Mensaje de error del correo institucional, o null si es válido. */
export const getInstitutionalEmailError = (value) => {
  if (isBlank(value)) return 'Ingresa tu correo institucional.';
  if (!isValidEmail(value)) return 'Ingresa un correo válido.';
  if (!isInstitutionalEmail(value)) return `El correo debe terminar en ${INSTITUTIONAL_DOMAIN}`;
  return null;
};

export const isPasswordValid = (password) =>
  passwordRules(password).every((rule) => rule.ok);

export const passwordsMatch = (password, confirmation) =>
  password === confirmation;

export const isBlank = (value) => String(value ?? '').trim() === '';