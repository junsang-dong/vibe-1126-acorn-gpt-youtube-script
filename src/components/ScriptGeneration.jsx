import React, { useState } from 'react';
import axios from 'axios';

function ScriptGeneration({ title, referenceContent, targetAudience, tone, onBack, onReset }) {
  const [duration, setDuration] = useState(10);
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [condensing, setCondensing] = useState(false);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [isGenerationStarted, setIsGenerationStarted] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setCondensing(false);
    setError('');
    setScript('');
    setIsGenerationStarted(true);
    setMetadata(null);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          referenceContent,
          duration,
          targetAudience,
          tone
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.content) {
                setScript(prev => prev + data.content);
              } else if (data.status === 'condensing') {
                setCondensing(true);
              } else if (data.status === 'complete') {
                setMetadata(data.metadata);
                setLoading(false);
                setCondensing(false);
              } else if (data.error) {
                setError(data.error);
                setLoading(false);
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
      }
    } catch (err) {
      setError('대본 생성 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleDownload = (format) => {
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      alert('클립보드에 복사되었습니다!');
    } catch (err) {
      alert('복사에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {!isGenerationStarted ? (
        <div className="card max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            대본 길이 선택
          </h2>
          <p className="text-gray-600 mb-6">
            선택한 제목: <span className="font-semibold text-primary-600">{title}</span>
          </p>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              영상 길이: {duration}분
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">5분</span>
              <input
                type="range"
                min="5"
                max="15"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-500">15분</span>
            </div>
            <div className="flex justify-between mt-2">
              <button
                onClick={() => setDuration(5)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  duration === 5
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                5분 (약 650단어)
              </button>
              <button
                onClick={() => setDuration(10)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  duration === 10
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                10분 (약 1,300단어)
              </button>
              <button
                onClick={() => setDuration(15)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  duration === 15
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                15분 (약 1,950단어)
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button onClick={onBack} className="btn-secondary flex-1">
              뒤로
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? '생성 중...' : '대본 생성 시작'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Script preview */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  생성된 대본
                </h2>
                {metadata && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📝 {metadata.wordCount}단어</span>
                    <span>⏱️ {(metadata.duration / 1000).toFixed(1)}초</span>
                  </div>
                )}
              </div>

              {loading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm text-blue-800">
                      {condensing ? '대본이 너무 길어 압축하는 중...' : 'AI가 대본을 작성하고 있습니다...'}
                    </span>
                  </div>
                </div>
              )}

              <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-6 min-h-[500px] max-h-[600px] overflow-y-auto border border-gray-200">
                {script ? (
                  <pre className="whitespace-pre-wrap font-sans text-gray-900">
                    {script}
                  </pre>
                ) : (
                  <div className="text-gray-400 italic">
                    대본이 여기에 표시됩니다...
                  </div>
                )}
              </div>

              {script && !loading && (
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleDownload('md')}
                    className="btn-secondary flex-1"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    .md 다운로드
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    className="btn-secondary flex-1"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    .txt 다운로드
                  </button>
                  <button
                    onClick={handleCopy}
                    className="btn-secondary flex-1"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    복사
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">📋 대본 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">제목:</span>
                  <span className="font-medium text-gray-900 text-right ml-2">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">길이:</span>
                  <span className="font-medium text-gray-900">{duration}분</span>
                </div>
                {targetAudience && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">타깃:</span>
                    <span className="font-medium text-gray-900 text-right ml-2">{targetAudience}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">🎬 다음 단계</h3>
              <div className="space-y-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full btn-secondary text-sm"
                >
                  다른 길이로 재생성
                </button>
                <button
                  onClick={onBack}
                  className="w-full btn-secondary text-sm"
                >
                  다른 제목 선택
                </button>
                <button
                  onClick={onReset}
                  className="w-full btn-secondary text-sm"
                >
                  처음부터 다시
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">💡 활용 팁</h3>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>• 생성된 대본은 자유롭게 수정 가능합니다</li>
                <li>• Markdown 형식으로 구조화되어 있습니다</li>
                <li>• 화면 지시사항을 참고해 영상을 제작하세요</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScriptGeneration;

