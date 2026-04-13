import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline" | "success";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center px-5 py-2.5 font-semibold rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all transform hover:-translate-y-0.5 duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const variantClasses = {
    primary:
      "bg-primary text-white shadow hover:shadow-lg hover:bg-primary-dark focus-visible:ring-primary",
    secondary:
      "bg-secondary text-white shadow hover:shadow-lg hover:bg-secondary-dark focus-visible:ring-secondary",
    danger:
      "bg-danger text-white hover:bg-danger-dark shadow hover:shadow-lg focus-visible:ring-danger",
    success:
      "bg-success text-white hover:bg-success-dark shadow hover:shadow-lg focus-visible:ring-success",
    outline:
      "bg-surface/50 border border-neutral-light/50 text-neutral-dark hover:bg-surface/80 hover:border-neutral-light focus-visible:ring-neutral-dark",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
