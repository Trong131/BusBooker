import React, { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  className = "",
}) => {
  return (
    <p className={`text-2xl font-semibold ${className}`}>{children}</p>
  );
};

export default SectionTitle;

