import React from 'react';
import { Page } from '../App.tsx';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-8">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2024 SubSynapse. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <button onClick={() => onNavigate('terms')} className="hover:text-gray-400">Terms and Conditions</button>
          <button onClick={() => onNavigate('privacy')} className="hover:text-gray-400">Privacy Policy</button>
          <button onClick={() => onNavigate('cancellation-refunds')} className="hover:text-gray-400">Cancellation & Refunds</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
