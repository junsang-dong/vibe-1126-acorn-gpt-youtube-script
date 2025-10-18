import React, { useState } from 'react';
import axios from 'axios';

function InputStep({ onComplete }) {
  const [inputMode, setInputMode] = useState('youtube'); // 'youtube' or 'file'
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState(null);
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/extract-youtube', { url: youtubeUrl });
      onComplete(response.data.transcript, targetAudience, tone);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        '자막을 추출할 수 없습니다. URL을 확인하거나 파일 업로드를 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload-script', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onComplete(response.data.content, targetAudience, tone);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        '파일을 업로드할 수 없습니다. 파일 형식과 크기를 확인해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 1024 * 1024) {
        setError('파일 크기는 1MB 이하여야 합니다.');
        return;
      }
      if (!selectedFile.name.endsWith('.txt')) {
        setError('txt 파일만 업로드 가능합니다.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          참조 콘텐츠 입력
        </h2>
        <p className="text-gray-600 mb-6">
          유튜브 영상의 자막이나 대본 파일을 업로드하세요. 이를 기반으로 새로운 콘텐츠 아이디어를 생성합니다.
        </p>

        {/* Input mode toggle */}
        <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setInputMode('youtube')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              inputMode === 'youtube'
                ? 'bg-white text-primary-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            유튜브 URL
          </button>
          <button
            onClick={() => setInputMode('file')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              inputMode === 'file'
                ? 'bg-white text-primary-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            파일 업로드
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {inputMode === 'youtube' ? (
          <form onSubmit={handleYoutubeSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                유튜브 URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="input-field"
                required
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500">
                ⚠️ 공개 자막이 있는 영상만 지원됩니다
              </p>
            </div>

            <OptionalFields
              targetAudience={targetAudience}
              setTargetAudience={setTargetAudience}
              tone={tone}
              setTone={setTone}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !youtubeUrl}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  자막 추출 중...
                </span>
              ) : (
                '다음 단계로'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFileSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대본 파일 (.txt)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>파일 선택</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept=".txt"
                        onChange={handleFileChange}
                        disabled={loading}
                      />
                    </label>
                    <p className="pl-1">또는 드래그 앤 드롭</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    .txt 파일, UTF-8 인코딩, 최대 1MB
                  </p>
                  {file && (
                    <p className="text-sm text-primary-600 font-medium">
                      선택된 파일: {file.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <OptionalFields
              targetAudience={targetAudience}
              setTargetAudience={setTargetAudience}
              tone={tone}
              setTone={setTone}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !file}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  파일 업로드 중...
                </span>
              ) : (
                '다음 단계로'
              )}
            </button>
          </form>
        )}
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <InfoCard
          icon="🎯"
          title="정확한 분석"
          description="GPT-4를 활용한 심층 콘텐츠 분석"
        />
        <InfoCard
          icon="⚡"
          title="빠른 생성"
          description="몇 초 만에 완성도 높은 대본 생성"
        />
        <InfoCard
          icon="🔒"
          title="안전한 처리"
          description="업로드된 파일은 즉시 삭제됩니다"
        />
      </div>
    </div>
  );
}

function OptionalFields({ targetAudience, setTargetAudience, tone, setTone, disabled }) {
  return (
    <div className="space-y-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          타깃 시청자 (선택사항)
        </label>
        <input
          type="text"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="예: 20-30대 직장인, 초보 개발자 등"
          className="input-field"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          톤 & 스타일 (선택사항)
        </label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="input-field"
          disabled={disabled}
        >
          <option value="">기본 (정보 전달 + 친근함)</option>
          <option value="professional">전문적이고 공식적인</option>
          <option value="casual">캐주얼하고 편안한</option>
          <option value="enthusiastic">열정적이고 에너지 넘치는</option>
          <option value="educational">교육적이고 설명 위주</option>
          <option value="storytelling">스토리텔링 중심</option>
        </select>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, description }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

export default InputStep;

