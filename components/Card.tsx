import React from "react";

// Fix: Extend React.HTMLAttributes<HTMLDivElement> to allow passing standard div props like onClick.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  ...props
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
  };

  return (
    <div
      {...props}
      className={`bg-surface/70 backdrop-blur-xl rounded-2xl shadow-md overflow-hidden ${className}`}
    >
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
};

export default Card;
