import React, { ReactNode } from "react";

interface HorizontalScrollContainerProps {
  children: ReactNode;
  className?: string;
}

const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`flex overflow-x-auto whitespace-nowrap gap-4 p-4 snap-x snap-mandatory ${className}`}
    >
      {children}
    </div>
  );
};

export default HorizontalScrollContainer;

