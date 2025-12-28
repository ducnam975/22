// DOM Helpers
export const el = id => document.getElementById(id);
export const qs = selector => document.querySelector(selector);
export const qsa = selector => document.querySelectorAll(selector);
export const create = (tag, className) => {
  const elem = document.createElement(tag);
  if (className) elem.className = className;
  return elem;
};

// Time Helpers
export const nowIso = () => new Date().toISOString();
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
};

// ID Generators
export const generateId = (prefix = 'ID') => {
  return `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
};

// String Helpers
export const escapeHtml = (s) => {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
};

export const unescapeHtml = (s) => {
  const div = document.createElement('div');
  div.innerHTML = s;
  return div.textContent;
};

// File Helpers
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Notification
export const notify = (message, type = 'info') => {
  // Simple alert for now, can be enhanced with toast
  alert(message);
  return true;
};

// Debounce
export const debounce = (func, wait = 200) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  if (password.length < 6) return false;
  return true;
};

// Password Strength
export const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[a-z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  return Math.min(score, 100);
};