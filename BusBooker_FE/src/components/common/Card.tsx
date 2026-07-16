import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  width?: string;
  height?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  onClick,
  className = "",
  width = "w-[350px]",
  height = "h-68",
}) => {
  return (
    <div
      className={`${width} ${height} max-md:h-48 max-md:w-[210px] flex-shrink-0 rounded-lg shadow-lg bg-white flex flex-col overflow-hidden snap-start cursor-pointer pb-1 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

