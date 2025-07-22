export function generatePatientCode() {
  const letters = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
  const numbers = String(Math.floor(100 + Math.random() * 900));
  return letters + numbers;
} 