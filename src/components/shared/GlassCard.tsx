import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#1C2541] border border-[#2A375E] rounded-lg p-4 shadow-card text-[#F8FAFC] ${className}`}
    >
      {children}
    </div>
  );
}
