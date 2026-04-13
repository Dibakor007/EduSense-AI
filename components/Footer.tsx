import React from "react";
import { BookOpenIcon } from "./icons";

const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto bg-white/30 backdrop-blur-lg border-t border-black/5">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-neutral-medium">
        <div className="flex justify-center items-center mb-4">
          <BookOpenIcon className="h-6 w-6 text-primary" />
          <h1 className="ml-2 text-lg font-display font-bold text-neutral-dark">
            EduSense AI
          </h1>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} EduSense AI. All Rights Reserved.
        </p>
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <a href="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
