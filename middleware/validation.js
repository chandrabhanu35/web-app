// Security validation middleware

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

export const validatePassword = (password) => {
  // At least 6 chars, but production should require more (12+)
  return password && password.length >= 6 && password.length <= 255;
};

export const validateMobile = (mobile) => {
  // 10-15 digits
  const mobileRegex = /^\d{10,15}$/;
  return mobileRegex.test(mobile.replace(/[^\d]/g, ''));
};

export const validateName = (name) => {
  // Allow letters, spaces, hyphens, 2-100 chars
  const nameRegex = /^[a-zA-Z\s\-']{2,100}$/;
  return nameRegex.test(name);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Remove potentially harmful characters but keep safe ones
  return input.trim().slice(0, 1000); // Max 1000 chars
};

export const validateInput = {
  email: (val) => {
    if (!val) return { valid: false, error: 'Email is required' };
    if (!validateEmail(val)) return { valid: false, error: 'Invalid email format' };
    return { valid: true };
  },

  password: (val) => {
    if (!val) return { valid: false, error: 'Password is required' };
    if (!validatePassword(val)) return { valid: false, error: 'Password must be 6-255 characters' };
    return { valid: true };
  },

  mobile: (val) => {
    if (!val) return { valid: false, error: 'Mobile is required' };
    if (!validateMobile(val)) return { valid: false, error: 'Invalid mobile format (10-15 digits required)' };
    return { valid: true };
  },

  name: (val) => {
    if (!val) return { valid: false, error: 'Name is required' };
    if (!validateName(val)) return { valid: false, error: 'Name must be 2-100 characters (letters, spaces, hyphens, apostrophes only)' };
    return { valid: true };
  },

  examType: (val) => {
    const allowedExams = ['JEE', 'NEET', 'GATE', 'SSC', 'CAT', 'GMAT']; // Add your exams
    if (!val) return { valid: false, error: 'Exam type is required' };
    if (!allowedExams.includes(val)) return { valid: false, error: `Exam type must be one of: ${allowedExams.join(', ')}` };
    return { valid: true };
  },

  difficulty: (val) => {
    const allowedDifficulties = ['easy', 'medium', 'hard'];
    if (!val) return { valid: false, error: 'Difficulty is required' };
    if (!allowedDifficulties.includes(val?.toLowerCase())) return { valid: false, error: 'Difficulty must be easy, medium, or hard' };
    return { valid: true };
  },

  percentage: (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return { valid: false, error: 'Percentage must be a number' };
    if (num < 0 || num > 100) return { valid: false, error: 'Percentage must be between 0 and 100' };
    return { valid: true };
  },

  positiveInt: (val, fieldName = 'Value') => {
    const num = parseInt(val);
    if (isNaN(num) || num < 0) return { valid: false, error: `${fieldName} must be a positive integer` };
    return { valid: true };
  }
};

export default validateInput;
