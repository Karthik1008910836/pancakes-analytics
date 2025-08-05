const validatePasswordStrength = (password) => {
  const requirements = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };

  const errors = [];

  if (!requirements.length) {
    errors.push('Password must be at least 6 characters long');
  }
  if (!requirements.uppercase) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }
  if (!requirements.lowercase) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }
  if (!requirements.number) {
    errors.push('Password must contain at least one number (0-9)');
  }

  const isValid = requirements.length && requirements.uppercase && requirements.lowercase && requirements.number;

  return {
    isValid,
    errors,
    requirements
  };
};

module.exports = {
  validatePasswordStrength
};