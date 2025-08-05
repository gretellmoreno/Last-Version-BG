import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserRoleDebug() {
  const { isAdmin, isEmployee, currentUserRole, userContext } = useAuth();

  // Só mostrar em desenvolvimento
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-xs z-50">
      <div className="font-semibold text-yellow-800 mb-1">Debug - Role do Usuário</div>
      <div className="space-y-1 text-yellow-700">
        <div>Role: {currentUserRole || 'null'}</div>
        <div>isAdmin: {isAdmin ? '✅' : '❌'}</div>
        <div>isEmployee: {isEmployee ? '✅' : '❌'}</div>
        <div>Salões: {userContext?.salons?.length || 0}</div>
        {userContext?.salons?.[0] && (
          <div>Primeiro salão: {userContext.salons[0].name} ({userContext.salons[0].role})</div>
        )}
      </div>
    </div>
  );
} 