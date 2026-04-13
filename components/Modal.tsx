import React, { useEffect, useRef } from "react";
import { XCircleIcon } from "./icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Effect for handling the Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]); // `onClose` is a dependency to ensure we always call the latest version.

  // Effect for focusing the modal ONLY when it opens
  useEffect(() => {
    if (isOpen) {
      // Focus the modal for screen readers and keyboard users, but only once when it opens.
      setTimeout(() => modalRef.current?.focus(), 100);
    }
  }, [isOpen]); // This effect ONLY depends on `isOpen`.

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white/80 backdrop-blur-xl w-full max-w-2xl rounded-2xl shadow-2xl m-4 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1} // Make it focusable
      >
        <header className="flex items-center justify-between p-6 border-b border-black/10">
          <h2
            id="modal-title"
            className="text-2xl font-bold font-display text-neutral-extradark"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-medium hover:text-neutral-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
            aria-label="Close modal"
          >
            <XCircleIcon className="h-7 w-7" />
          </button>
        </header>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
