import React, { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
}

const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`mx-auto max-md:w-[90%] w-[70%] mt-[50px] ${className}`}>
      {children}
    </div>
  );
};

export default SectionContainer;

