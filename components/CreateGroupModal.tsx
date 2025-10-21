import React, { useState } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import CustomSelect from './CustomSelect';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const services = [
    { value: 'netflix', label: 'Netflix' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'disney', label: 'Disney+' },
    { value: 'hbo', label: 'HBO Max' },
    { value: 'office', label: 'Microsoft 365' },
    { value: 'adobe', label: 'Adobe CC' },
    { value: 'canva', label: 'Canva' },
];
const categories = ['Video', 'Music', 'Productivity', 'Design'].map(c => ({ value: c, label: c }));

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input 
            {...props}
            className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400 transition"
        />
    </div>
);


const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const [formState, setFormState] = useState({
      service: 'netflix',
      name: '',
      totalPrice: '',
      slotsTotal: '',
      category: 'Video',
      tags: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
      setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real app, this would submit the form data
      console.log('Creating group:', formState);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <GlassmorphicCard 
        className="w-full max-w-lg m-4 p-8 relative" 
        onClick={(e) => e.stopPropagation()}
        hasAnimation
        isReady={isOpen}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Create a New Group</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <CustomSelect 
              label="Service"
              options={services}
              value={formState.service}
              onChange={(value) => handleSelectChange('service', value)}
            />
            <FormInput label="Group Name (e.g. Netflix Premium Family)" name="name" type="text" placeholder="My Awesome Netflix Group" value={formState.name} onChange={handleInputChange} required />
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Total Monthly Price (₹)" name="totalPrice" type="number" placeholder="1660" value={formState.totalPrice} onChange={handleInputChange} required />
                <FormInput label="Total Slots (including you)" name="slotsTotal" type="number" placeholder="4" value={formState.slotsTotal} onChange={handleInputChange} required />
            </div>
             <CustomSelect 
               label="Category"
               options={categories}
               value={formState.category}
               onChange={(value) => handleSelectChange('category', value)}
             />
            <FormInput label="Tags (comma separated)" name="tags" type="text" placeholder="4K, UHD, Movies" value={formState.tags} onChange={handleInputChange} />

            <div className="pt-4 flex justify-end gap-4">
                 <button 
                    type="button"
                    onClick={onClose}
                    className="font-semibold py-2 px-6 rounded-xl transition duration-300 bg-white/10 hover:bg-white/20 text-white"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="font-bold py-2 px-6 rounded-xl transition duration-300 bg-sky-500 hover:bg-sky-400 text-white"
                >
                    Create Group
                </button>
            </div>
        </form>
      </GlassmorphicCard>
    </div>
  );
};

export default CreateGroupModal;