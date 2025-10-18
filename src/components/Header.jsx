import React from 'react';

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg 
                className="w-7 h-7 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" 
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                유튜브 대본 생성기
              </h1>
              <p className="text-sm text-gray-600">
                AI 기반 영상 스크립트 자동 생성 도구
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              ✓ GPT-4 Powered
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              실시간 스트리밍
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

