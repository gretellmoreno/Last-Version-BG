import React from 'react';

const LandingPageLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white font-bold text-3xl">B</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">BelaGestão</h1>
        <p className="text-gray-600 mb-4">Carregando...</p>
        <div className="flex items-center justify-center space-x-2 text-purple-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
          <span className="text-sm">Aguarde...</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPageLoader; 