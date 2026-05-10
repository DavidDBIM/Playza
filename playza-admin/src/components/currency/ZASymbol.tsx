import React from "react";

interface ZASymbolProps {
  className?: string;
}

export const ZASymbol: React.FC<ZASymbolProps> = ({ className = "" }) => {
  return (
    <span className={`inline-flex items-center font-black tracking-tighter italic bg-clip-text text-transparent bg-linear-to-br from-yellow-300 via-amber-400 to-yellow-600 ${className}`}>
      ZA
    </span>
  );
};
