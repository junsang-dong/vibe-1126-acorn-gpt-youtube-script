# 시스템 아키텍처

GPT API 기반 유튜브 롱폼 영상 대본 생성 웹앱의 시스템 아키텍처 문서입니다.

## 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ InputStep  │→ │TitleSelect │→ │ScriptGen   │       │
│  └────────────┘  └────────────┘  └────────────┘       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/SSE
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Backend (Express + Node.js)                 │
│  ┌──────────────────────────────────────────────┐      │
│  │              API Routes                       │      │
│  │  • /api/extract-youtube                      │      │
│  │  • /api/upload-script                        │      │
│  │  • /api/generate-titles                      │      │
│  │  • /api/generate-script (SSE)               │      │
│  └───────────────┬──────────────────────────────┘      │
│                  │                                       │
│  ┌───────────────▼──────────────────────────────┐      │
│  │          Middleware Layer                     │      │
│  │  • Rate Limiting (30 req/min)               │      │
│  │  • Request Validation & Sanitization        │      │
│  │  • Security Headers                          │      │
│  │  • Logging (Pino)                           │      │
│  └───────────────┬──────────────────────────────┘      │
│                  │                                       │
│  ┌───────────────▼──────────────────────────────┐      │
│  │          Business Logic                       │      │
│  │  • Text Normalization                        │      │
│  │  • Chunking & Summarization                 │      │
│  │  • Prompt Engineering                        │      │
│  │  • Word Count Estimation                    │      │
│  └───────────────┬──────────────────────────────┘      │
└────────────────────┼────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
│  ┌──────────────────┐    ┌──────────────────┐         │
│  │  OpenAI GPT-4   │    │ YouTube Transcript│         │
│  │      API        │    │      API          │         │
│  └──────────────────┘    └──────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

## 디렉토리 구조

```
vibe-1126-acorn-gpt-youtube-script/
├── server/                      # 백엔드 서버
│   ├── index.js                # 메인 서버 파일
│   ├── routes/                 # API 라우트
│   │   ├── generateTitles.js
│   │   ├── generateScript.js
│   │   ├── extractYoutube.js
│   │   └── uploadScript.js
│   ├── utils/                  # 유틸리티 함수
│   │   ├── openai.js          # OpenAI 클라이언트 & 헬퍼
│   │   └── prompts.js         # 프롬프트 템플릿
│   ├── middleware/             # 미들웨어
│   │   ├── validation.js      # 입력 검증
│   │   └── security.js        # 보안 설정
│   └── uploads/               # 임시 업로드 폴더
│
├── src/                        # 프론트엔드
│   ├── components/            # React 컴포넌트
│   │   ├── Header.jsx
│   │   ├── InputStep.jsx
│   │   ├── TitleSelection.jsx
│   │   └── ScriptGeneration.jsx
│   ├── App.jsx               # 메인 앱 컴포넌트
│   ├── main.jsx              # 진입점
│   └── index.css             # 스타일
│
├── dist/                       # 빌드 결과물 (자동 생성)
├── node_modules/              # 의존성 (자동 생성)
│
├── package.json               # 프로젝트 설정
├── vite.config.js            # Vite 설정
├── tailwind.config.js        # Tailwind 설정
├── postcss.config.js         # PostCSS 설정
├── .eslintrc.cjs             # ESLint 설정
├── .prettierrc               # Prettier 설정
│
├── .env                       # 환경 변수 (생성 필요)
├── .env.template             # 환경 변수 템플릿
├── .gitignore                # Git 무시 파일
│
├── README.md                 # 프로젝트 소개
├── USAGE_GUIDE.md           # 사용 가이드
├── DEPLOYMENT.md            # 배포 가이드
├── ARCHITECTURE.md          # 이 파일
├── LICENSE                   # 라이선스
│
├── netlify.toml             # Netlify 배포 설정
├── vercel.json              # Vercel 배포 설정
└── example-transcript.txt   # 예제 대본 파일
```

## 데이터 흐름

### 1. 유튜브 URL 입력 흐름

```
User Input (URL)
    ↓
[InputStep] Validate URL
    ↓
POST /api/extract-youtube
    ↓
[extractYoutube.js]
    ├─→ Extract video ID
    ├─→ Fetch transcript (youtube-transcript)
    ├─→ Normalize text
    └─→ Return transcript
    ↓
[App State] Store reference content
    ↓
Navigate to Step 2
```

### 2. 파일 업로드 흐름

```
User Upload (.txt)
    ↓
[InputStep] File validation
    ↓
POST /api/upload-script (multipart/form-data)
    ↓
[uploadScript.js]
    ├─→ Multer file handling
    ├─→ Validate file type & size
    ├─→ Read & normalize text
    ├─→ Delete temp file
    └─→ Return content
    ↓
[App State] Store reference content
    ↓
Navigate to Step 2
```

### 3. 제목 생성 흐름

```
Reference Content + Options
    ↓
POST /api/generate-titles
    ↓
[generateTitles.js]
    ├─→ Validate input
    ├─→ Summarize if too long
    │   └─→ [chunkText → map-reduce summarization]
    ├─→ Build prompt
    └─→ Call OpenAI API (GPT-4)
    ↓
[OpenAI] Generate 3 titles
    ↓
[parseTitles] Extract structured data
    ↓
Return titles array
    ↓
[TitleSelection] Display & select
```

### 4. 대본 생성 흐름 (Streaming)

```
Title + Duration + Reference
    ↓
POST /api/generate-script
    ↓
[generateScript.js]
    ├─→ Validate input
    ├─→ Estimate target word count
    ├─→ Summarize reference if needed
    ├─→ Build script prompt
    └─→ Call OpenAI API (GPT-4, stream: true)
    ↓
[OpenAI Streaming]
    ├─→ Chunk 1 → SSE → [Frontend] Display
    ├─→ Chunk 2 → SSE → [Frontend] Append
    ├─→ Chunk 3 → SSE → [Frontend] Append
    └─→ ... (continue)
    ↓
[Check Word Count]
    ├─→ If too long → Condense
    │   └─→ Call GPT again with condense prompt
    └─→ If OK → Complete
    ↓
SSE: status=complete
    ↓
[ScriptGeneration] Show download options
```

## 핵심 컴포넌트 설명

### Backend Components

#### 1. Server (`server/index.js`)
- Express 앱 초기화
- 미들웨어 설정 (CORS, body-parser, rate limiting)
- 라우트 등록
- 에러 핸들링
- 로깅 (Pino)

#### 2. OpenAI Utilities (`server/utils/openai.js`)
- **chunkText**: 대용량 텍스트를 청크로 분할
- **summarizeLargeText**: Map-reduce 방식으로 요약
- **normalizeText**: 텍스트 정규화 (타임스탬프 제거 등)
- **estimateWordCount**: 분당 단어 수 계산
- **retryWithBackoff**: 지수 백오프로 재시도

#### 3. Prompt Engineering (`server/utils/prompts.js`)
- **SYSTEM_PROMPT**: AI 역할 정의
- **generateTitlesPrompt**: 제목 생성 프롬프트
- **generateScriptPrompt**: 대본 생성 프롬프트 (구조화)
- **condenseScriptPrompt**: 대본 축약 프롬프트
- **parseTitles**: 응답에서 제목 추출

#### 4. Validation Middleware (`server/middleware/validation.js`)
- 입력 검증 및 XSS 방지
- YouTube URL 유효성 검사
- 텍스트 길이 검증
- 요청 메트릭 로깅

#### 5. Security Middleware (`server/middleware/security.js`)
- 보안 헤더 추가
- Content-Type 검증
- 요청 크기 제한
- API 키 검증 (옵션)

### Frontend Components

#### 1. App (`src/App.jsx`)
- 메인 애플리케이션 컨테이너
- 단계별 상태 관리
- 프로그레스 인디케이터
- 단계 간 네비게이션

#### 2. InputStep (`src/components/InputStep.jsx`)
- 유튜브 URL / 파일 업로드 탭
- 옵션 설정 (타깃 시청자, 톤)
- 입력 검증
- API 호출 및 에러 처리

#### 3. TitleSelection (`src/components/TitleSelection.jsx`)
- 생성된 제목 표시
- 제목 선택 UI
- 제목 재생성 기능
- 로딩 상태 표시

#### 4. ScriptGeneration (`src/components/ScriptGeneration.jsx`)
- 길이 선택 (5/10/15분)
- 실시간 스트리밍 표시
- 대본 미리보기
- 다운로드 & 복사 기능

## 보안 고려사항

### 1. API 키 보호
```javascript
// ❌ 클라이언트에서 직접 사용 금지
const openai = new OpenAI({ apiKey: 'sk-...' });

// ✅ 서버 환경변수로만 관리
const apiKey = process.env.OPENAI_API_KEY;
```

### 2. 입력 검증
- XSS 방지: HTML 태그 제거
- SQL Injection 방지 (DB 사용 시)
- 파일 타입 검증: MIME type + 확장자
- 크기 제한: 1MB 최대

### 3. 레이트 리미팅
```javascript
// IP 기반 요청 제한
rateLimit({
  windowMs: 60000,  // 1분
  max: 30           // 최대 30 요청
})
```

### 4. CORS 설정
```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

## 성능 최적화

### 1. 대용량 텍스트 처리
- **Chunking**: 2-3k 토큰 단위로 분할
- **Map-Reduce**: 각 청크 요약 후 병합
- **병렬 처리**: Promise.all로 동시 처리

### 2. 스트리밍
- Server-Sent Events (SSE) 사용
- 실시간 응답 표시로 UX 개선
- 메모리 효율성 향상

### 3. 캐싱
- 로컬 스토리지에 세션 데이터 저장
- 재사용 가능한 참조 콘텐츠 캐싱

### 4. 에러 복구
- 지수 백오프 재시도
- 부분 결과 저장
- 사용자 친화적 에러 메시지

## API 사용량 최적화

### 토큰 절약 전략
1. **요약 활용**: 긴 텍스트는 먼저 요약
2. **모델 선택**: 
   - 제목 생성: GPT-4-mini (저렴)
   - 대본 생성: GPT-4 (고품질)
3. **프롬프트 최적화**: 불필요한 설명 제거
4. **max_tokens 제한**: 적절한 길이 제한

### 비용 추정
```
제목 생성 (1회):
- Input: ~500 tokens
- Output: ~100 tokens
- 비용: ~$0.01

대본 생성 (10분, 1회):
- Input: ~2,000 tokens
- Output: ~2,000 tokens
- 비용: ~$0.08

월 예상 비용 (사용자 100명):
- ~$10-20
```

## 확장 가능성

### 1. 데이터베이스 추가
```
PostgreSQL / MongoDB
├─→ 사용자 관리
├─→ 대본 히스토리 저장
├─→ 사용량 추적
└─→ 템플릿 라이브러리
```

### 2. 인증 시스템
```
JWT / OAuth
├─→ 사용자 로그인
├─→ API 키 관리
└─→ 사용량 제한
```

### 3. 고급 기능
- PDF 내보내기
- 음성 합성 (TTS)
- 다국어 지원 확장
- A/B 테스트 기능
- 협업 기능

### 4. 모니터링
```
Prometheus + Grafana
├─→ API 응답 시간
├─→ 에러율
├─→ 비용 추적
└─→ 사용자 활동
```

## 기술 스택 상세

### Frontend
- **React 18**: UI 라이브러리
- **Vite**: 빌드 도구 (빠른 HMR)
- **Tailwind CSS**: 유틸리티 CSS
- **Axios**: HTTP 클라이언트

### Backend
- **Node.js 18+**: 런타임
- **Express 4**: 웹 프레임워크
- **OpenAI SDK**: GPT API 클라이언트
- **Pino**: 고성능 로깅
- **Multer**: 파일 업로드
- **express-rate-limit**: 레이트 리미팅

### DevOps
- **Git**: 버전 관리
- **npm**: 패키지 매니저
- **ESLint**: 코드 린팅
- **Prettier**: 코드 포맷팅

### Deployment
- **Netlify / Vercel**: Serverless
- **Railway / Heroku**: Traditional hosting
- **Docker**: 컨테이너화 (옵션)

## 트러블슈팅 가이드

### 일반적인 문제

1. **OpenAI API 타임아웃**
   - 원인: 네트워크 지연, 긴 처리 시간
   - 해결: 재시도 로직, 타임아웃 증가

2. **레이트 리밋 초과**
   - 원인: 짧은 시간 내 많은 요청
   - 해결: 프론트엔드 디바운싱, 레이트 리밋 완화

3. **메모리 누수**
   - 원인: 스트림 연결 미종료
   - 해결: 적절한 cleanup, 연결 종료

4. **CORS 에러**
   - 원인: 도메인 불일치
   - 해결: CORS 설정 확인, 환경변수 설정

## 참고 자료

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

