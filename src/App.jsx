import React, { useState } from 'react';
import InputStep from './components/InputStep';
import TitleSelection from './components/TitleSelection';
import ScriptGeneration from './components/ScriptGeneration';
import Header from './components/Header';

function App() {
  const [step, setStep] = useState(1);
  const [referenceContent, setReferenceContent] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('');

  const handleInputComplete = (content, audience, scriptTone) => {
    setReferenceContent(content);
    setTargetAudience(audience);
    setTone(scriptTone);
    setStep(2);
  };

  const handleTitleSelected = (title) => {
    setSelectedTitle(title);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setReferenceContent('');
    setSelectedTitle('');
    setTargetAudience('');
    setTone('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <StepIndicator number={1} label="입력" active={step === 1} completed={step > 1} />
            <div className={`h-1 w-16 ${step > 1 ? 'bg-primary-600' : 'bg-gray-300'}`} />
            <StepIndicator number={2} label="제목 선택" active={step === 2} completed={step > 2} />
            <div className={`h-1 w-16 ${step > 2 ? 'bg-primary-600' : 'bg-gray-300'}`} />
            <StepIndicator number={3} label="대본 생성" active={step === 3} completed={false} />
          </div>
        </div>

        {/* Step content */}
        <div className="animate-fade-in">
          {step === 1 && (
            <InputStep onComplete={handleInputComplete} />
          )}

          {step === 2 && (
            <TitleSelection
              referenceContent={referenceContent}
              targetAudience={targetAudience}
              tone={tone}
              onTitleSelected={handleTitleSelected}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <ScriptGeneration
              title={selectedTitle}
              referenceContent={referenceContent}
              targetAudience={targetAudience}
              tone={tone}
              onBack={() => setStep(2)}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">
            Powered by OpenAI GPT-4 | 
            <a href="https://github.com" className="ml-2 text-primary-600 hover:underline">
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepIndicator({ number, label, active, completed }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
          active
            ? 'bg-primary-600 text-white scale-110 shadow-lg'
            : completed
            ? 'bg-green-500 text-white'
            : 'bg-gray-300 text-gray-600'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <span
        className={`mt-2 text-sm font-medium ${
          active ? 'text-primary-700' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default App;

