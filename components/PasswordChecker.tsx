import React, { useState, useEffect } from 'react';

export const PASSWORD_RULES = [
  {
    id: 1,
    description: "Your password must be at least 6 characters.",
    validate: (password: string) => password.length >= 6
  }
];

interface PasswordCheckerProps {
  password: string;
  onValidationChange: (isValid: boolean, currentRule: number) => void;
}

const PasswordChecker: React.FC<PasswordCheckerProps> = ({ password, onValidationChange }) => {
  if (!password || password.length === 0) {
    return null;
  }

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid = password.length >= 6;
    setIsValid(valid);
    onValidationChange(valid, valid ? 1 : 0);
  }, [password, onValidationChange]);

  if (isValid) {
    return (
      <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-green-400 text-xl">✅</span>
          <span className="text-green-400 font-medium">
            Password meets requirements
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
        <div className="flex items-start space-x-2">
          <span className="text-red-400 text-xl mt-0.5">❌</span>
          <div>
            <div className="text-slate-300">
              Your password must be at least 6 characters
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChecker;
