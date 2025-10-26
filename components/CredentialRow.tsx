import React, { useState } from 'react';

interface CredentialRowProps { 
  label: string; 
  value: string; 
  isPassword?: boolean;
}

const CredentialRow: React.FC<CredentialRowProps> = ({ label, value, isPassword = false }) => {
  const [isVisible, setIsVisible] = useState(!isPassword);
  const [copyText, setCopyText] = useState('Copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy'), 1500);
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-semibold text-slate-300">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-white bg-black/20 px-2 py-1 rounded">
          {isVisible ? value : '••••••••••••'}
        </span>
        {isPassword && (
          <button onClick={() => setIsVisible(!isVisible)} className="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              {isVisible ? (
                <>
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </>
              ) : (
                <path d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.367zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM10 18a8 8 0 100-16 8 8 0 000 16z" />
              )}
            </svg>
          </button>
        )}
        <button onClick={handleCopy} className="text-slate-400 hover:text-white text-xs font-semibold">{copyText}</button>
      </div>
    </div>
  );
};

export default CredentialRow;
