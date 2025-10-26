import React, { useState } from 'react';
import GlassmorphicCard from './GlassmorphicCard.tsx';
import CustomSelect from './CustomSelect.tsx';
import type { SubscriptionGroup, IconName } from '../types.ts';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: Omit<SubscriptionGroup, 'id' | 'postedBy' | 'slotsFilled' | 'status'>) => Promise<void>;
}

const services: { value: IconName, label: string }[] = [
    { value: 'netflix', label: 'Netflix' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'disney', label: 'Disney+' },
    { value: 'hbo', label: 'HBO Max' },
    { value: 'office', label: 'Microsoft 35' },
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


const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onCreateGroup }) => {
  const [formState, setFormState] = useState({
      icon: 'netflix' as IconName,
      name: '',
      totalPrice: '',
      slotsTotal: '',
      category: 'Video' as 'Video' | 'Music' | 'Productivity' | 'Design',
      tags: '',
      username: '',
      password: '',
      proof: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: 'icon' | 'category', value: string) => {
      if (name === 'category') {
          setFormState(prev => ({ ...prev, category: value as 'Video' | 'Music' | 'Productivity' | 'Design' }));
      } else {
          setFormState(prev => ({ ...prev, icon: value as IconName }));
      }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      const groupData = {
          ...formState,
          totalPrice: parseInt(formState.totalPrice),
          slotsTotal: parseInt(formState.slotsTotal),
          tags: formState.tags.split(',').map(tag => tag.trim()),
          credentials: {
              username: formState.username,
              password: formState.password,
          }
      };
      await onCreateGroup(groupData);
      setIsSubmitting(false);
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
            <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-lg text-center text-sky-200 text-sm">
                Your group will be pending review by an admin before it appears in the marketplace.
            </div>

            <CustomSelect 
              label="Service"
              options={services}
              value={formState.icon}
              onChange={(value) => handleSelectChange('icon', value)}
            />
            <FormInput label="Group Name (e.g. Netflix Premium Family)" name="name" type="text" placeholder="My Awesome Netflix Group" value={formState.name} onChange={handleInputChange} required />
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Total Monthly Price (Credits)" name="totalPrice" type="number" placeholder="1660" value={formState.totalPrice} onChange={handleInputChange} required />
                <FormInput label="Total Slots (including you)" name="slotsTotal" type="number" placeholder="4" value={formState.slotsTotal} onChange={handleInputChange} required />
            </div>

            <h3 className="text-lg font-semibold text-white pt-2">Subscription Credentials</h3>
            <FormInput label="Username / Email" name="username" type="text" placeholder="user@example.com" value={formState.username} onChange={handleInputChange} required />
            <FormInput label="Password" name="password" type="password" placeholder="••••••••••••" value={formState.password} onChange={handleInputChange} required />
            <FormInput label="Proof of Subscription (e.g., Imgur link to receipt)" name="proof" type="url" placeholder="https://imgur.com/your-proof" value={formState.proof} onChange={handleInputChange} required />
            
            <h3 className="text-lg font-semibold text-white pt-2">Group Details</h3>
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
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="font-bold py-2 px-6 rounded-xl transition duration-300 bg-sky-500 hover:bg-sky-400 text-white min-w-[150px]"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </button>
            </div>
        </form>
      </GlassmorphicCard>
    </div>
  );
};

export default CreateGroupModal;
