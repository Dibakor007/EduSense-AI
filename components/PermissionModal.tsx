import React from 'react';
import { MicIcon } from './icons';
import Button from './Button';

interface PermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onCancel: () => void;
  title: string;
  description: string;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onAllow, onCancel, title, description }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-modal-title"
      onClick={onCancel} // Close on overlay click
    >
      <div
        className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl m-4 animate-fade-in-up p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
            <MicIcon className="w-8 h-8"/>
        </div>
        <h2 id="permission-modal-title" className="text-2xl font-bold font-display text-neutral-extradark">
          {title}
        </h2>
        <p className="text-neutral-medium mt-2 mb-8">{description}</p>
        <div className="flex justify-center gap-4">
            <Button onClick={onCancel} variant="outline" className="!px-8 !py-3">
                Cancel
            </Button>
            <Button onClick={onAllow} variant="primary" className="!px-8 !py-3">
                Allow Access
            </Button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
