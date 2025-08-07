import React from 'react';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  icon?: string;
  className?: string;
}

export default function ErrorDisplay({ 
  title = "Erro ao carregar dados", 
  message, 
  icon = "⚠️",
  className = "" 
}: ErrorDisplayProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="text-red-500 mb-4 text-2xl">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
} 