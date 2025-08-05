export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-4 (weak to very strong)
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
  };
  suggestions: string[];
  strengthText: string;
  strengthColor: 'error' | 'warning' | 'info' | 'success';
}

export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  const requirements = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const suggestions: string[] = [];

  if (!requirements.length) {
    suggestions.push('• Use at least 6 characters');
  }
  if (!requirements.uppercase) {
    suggestions.push('• Include at least one UPPERCASE letter (A-Z)');
  }
  if (!requirements.lowercase) {
    suggestions.push('• Include at least one lowercase letter (a-z)');
  }
  if (!requirements.number) {
    suggestions.push('• Include at least one number (0-9)');
  }

  // Additional suggestions for better security
  if (password.length < 8) {
    suggestions.push('• Consider using 8+ characters for better security');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && metRequirements >= 3) {
    suggestions.push('• Consider adding special characters (!@#$%^&*) for extra security');
  }

  const isValid = requirements.length && requirements.uppercase && requirements.lowercase && requirements.number;
  
  let score = 0;
  let strengthText = '';
  let strengthColor: 'error' | 'warning' | 'info' | 'success' = 'error';

  if (metRequirements === 0) {
    score = 0;
    strengthText = 'Very Weak';
    strengthColor = 'error';
  } else if (metRequirements === 1) {
    score = 1;
    strengthText = 'Weak';
    strengthColor = 'error';
  } else if (metRequirements === 2) {
    score = 2;
    strengthText = 'Fair';
    strengthColor = 'warning';
  } else if (metRequirements === 3) {
    score = 3;
    strengthText = 'Good';
    strengthColor = 'info';
  } else if (metRequirements === 4) {
    if (password.length >= 8) {
      score = 4;
      strengthText = 'Strong';
      strengthColor = 'success';
    } else {
      score = 3;
      strengthText = 'Good';
      strengthColor = 'info';
    }
  }

  // Bonus points for special characters and length
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score = Math.min(4, score + 0.5);
    if (score >= 4) {
      strengthText = 'Very Strong';
      strengthColor = 'success';
    }
  }

  return {
    isValid,
    score,
    requirements,
    suggestions,
    strengthText,
    strengthColor,
  };
};

export const getPasswordRequirementsText = (): string[] => {
  return [
    'Password must contain:',
    '• At least 6 characters',
    '• At least one UPPERCASE letter (A-Z)',
    '• At least one lowercase letter (a-z)', 
    '• At least one number (0-9)',
  ];
};