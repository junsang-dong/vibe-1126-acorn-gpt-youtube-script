import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TitleSelection({ referenceContent, targetAudience, tone, onTitleSelected, onBack }) {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    generateTitles();
  }, []);

  const generateTitles = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/generate-titles', {
        referenceContent,
        targetAudience,
        tone
      });

      setTitles(response.data.titles);
    } catch (err) {
      setError(err.response?.data?.error || '제목을 생성할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleSelect = (index) => {
    setSelectedIndex(index);
  };

  const handleContinue = () => {
    if (selectedIndex !== null) {
      onTitleSelected(titles[selectedIndex]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              제목 선택
            </h2>
            <p className="text-gray-600">
              AI가 생성한 3가지 제목 중 하나를 선택하세요
            </p>
          </div>
          <button
            onClick={generateTitles}
            disabled={loading}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            <svg className={`w-5 h-5 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            다시 생성
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={generateTitles}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              재시도
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg loading-shimmer" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {titles.map((title, index) => (
              <div
                key={index}
                onClick={() => handleTitleSelect(index)}
                className={`p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedIndex === index
                    ? 'border-primary-500 bg-primary-50 shadow-md transform scale-[1.02]'
                    : 'border-gray-200 hover:border-primary-300 hover:shadow'
                }`}
              >
                <div className="flex items-start">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-1 ${
                      selectedIndex === index
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedIndex === index && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-xs font-semibold text-gray-500 mr-2">
                        제목 #{index + 1}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        title.length <= 50
                          ? 'bg-green-100 text-green-700'
                          : title.length <= 60
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {title.length}자
                      </span>
                    </div>
                    <p className={`text-lg font-medium ${
                      selectedIndex === index ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-4 mt-8">
          <button
            onClick={onBack}
            className="btn-secondary flex-1"
          >
            뒤로
          </button>
          <button
            onClick={handleContinue}
            disabled={selectedIndex === null}
            className="btn-primary flex-1"
          >
            선택한 제목으로 대본 생성
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 제목 선택 팁</p>
            <ul className="list-disc list-inside space-y-1">
              <li>클릭하기 쉬운 제목을 선택하세요</li>
              <li>타깃 시청자가 검색할 만한 키워드가 포함되어 있는지 확인하세요</li>
              <li>마음에 드는 제목이 없다면 "다시 생성" 버튼을 눌러보세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TitleSelection;

