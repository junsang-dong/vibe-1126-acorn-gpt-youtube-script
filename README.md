# 🎬 GPT API 기반 유튜브 롱폼 영상 대본 생성 웹앱

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)

유튜브 URL 또는 대본 텍스트 파일을 입력하면 GPT API를 활용하여 응용 콘텐츠 제목을 생성하고, 선택한 제목에 대해 5/10/15분 길이의 완성된 영상 대본을 생성하는 웹 애플리케이션입니다.

[빠른 시작](#빠른-시작) • [기능](#주요-기능) • [문서](#문서) • [배포](#배포)

</div>

---

## ✨ 주요 기능

<table>
<tr>
<td width="50%">

### 🎯 스마트 콘텐츠 생성
- 📹 **유튜브 자막 추출**: 공개 자막 자동 추출
- 📄 **파일 업로드**: .txt 파일 지원 (UTF-8, 1MB)
- 🤖 **AI 제목 생성**: 3개의 최적화된 제목 자동 생성
- ⏱️ **유연한 길이**: 5분/10분/15분 선택 가능

</td>
<td width="50%">

### 💎 전문적인 결과물
- 📝 **구조화된 대본**: 훅/시놉시스/씬/CTA 포함
- 🎥 **화면 지시사항**: 편집자를 위한 상세 가이드
- 💾 **다운로드**: Markdown/텍스트 형식 지원
- 🔄 **실시간 스트리밍**: GPT 응답 즉시 표시

</td>
</tr>
</table>

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 18 이상
- OpenAI API 키 ([발급받기](https://platform.openai.com/api-keys))

### 설치

\`\`\`bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.template .env

# 3. .env 파일에 OpenAI API 키 입력
# OPENAI_API_KEY=sk-your-api-key-here
\`\`\`

### 실행

\`\`\`bash
# 개발 서버 시작 (프론트엔드 + 백엔드)
npm run dev
\`\`\`

🎉 **완료!** 브라우저에서 http://localhost:5173 을 여세요.

더 자세한 가이드는 [QUICKSTART.md](QUICKSTART.md)를 참고하세요.

## 🛠️ 기술 스택

<table>
<tr>
<td align="center" width="25%">
<b>Frontend</b><br/>
React 18<br/>
Vite<br/>
Tailwind CSS
</td>
<td align="center" width="25%">
<b>Backend</b><br/>
Node.js<br/>
Express<br/>
Pino Logger
</td>
<td align="center" width="25%">
<b>AI</b><br/>
OpenAI GPT-4<br/>
Streaming API<br/>
Prompt Engineering
</td>
<td align="center" width="25%">
<b>Deployment</b><br/>
Netlify Functions<br/>
Serverless<br/>
CDN
</td>
</tr>
</table>

## 📦 프로젝트 구조

\`\`\`
vibe-1126-acorn-gpt-youtube-script/
├── server/                 # 백엔드 (Express)
│   ├── routes/            # API 라우트
│   ├── utils/             # 유틸리티 (OpenAI, Prompts)
│   └── middleware/        # 미들웨어 (보안, 검증)
├── src/                   # 프론트엔드 (React)
│   ├── components/        # UI 컴포넌트
│   └── App.jsx           # 메인 앱
├── package.json          # 프로젝트 설정
└── vite.config.js        # Vite 설정
\`\`\`

전체 아키텍처는 [ARCHITECTURE.md](ARCHITECTURE.md)를 참고하세요.

## 📚 문서

| 문서 | 설명 |
|------|------|
| [QUICKSTART.md](QUICKSTART.md) | 5분 안에 시작하기 |
| [USAGE_GUIDE.md](USAGE_GUIDE.md) | 자세한 사용 가이드 |
| [NETLIFY_DEPLOY_GUIDE.md](NETLIFY_DEPLOY_GUIDE.md) | 빠른 Netlify 배포 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 상세 배포 가이드 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 시스템 아키텍처 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 기여 가이드 |

## 🔌 API 엔드포인트

| 엔드포인트 | 메소드 | 설명 |
|-----------|--------|------|
| `/api/extract-youtube` | POST | 유튜브 자막 추출 |
| `/api/upload-script` | POST | 대본 파일 업로드 |
| `/api/generate-titles` | POST | 제목 3개 생성 |
| `/api/generate-script` | POST | 대본 생성 (스트리밍) |

자세한 API 문서는 [ARCHITECTURE.md](ARCHITECTURE.md#api)를 참고하세요.

## 🚀 Netlify 배포

### 빠른 배포

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### 수동 배포

1. **GitHub 저장소 준비**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Netlify에서 배포**
   - https://app.netlify.com 에서 로그인
   - "Add new site" → "Import an existing project" 클릭
   - GitHub 저장소 연결
   - Build settings 자동 감지 (netlify.toml)
   - Deploy 클릭

3. **환경 변수 설정**
   - Site settings → Environment variables
   - `OPENAI_API_KEY` 추가
   - 값에 OpenAI API 키 입력

4. **배포 완료!**
   - 자동으로 빌드 및 배포
   - 할당된 URL로 접속 가능
   - Custom domain 설정 가능

더 자세한 배포 가이드는 [DEPLOYMENT.md](DEPLOYMENT.md)를 참고하세요.

## 🔒 보안

- ✅ API 키는 서버 환경변수로만 관리
- ✅ 레이트 리미팅 (30 req/min/IP)
- ✅ XSS 방지 및 입력 검증
- ✅ CORS 보안 설정
- ✅ 보안 헤더 적용

## 💰 비용 안내

OpenAI API 사용량 기반 과금:
- 제목 생성: ~$0.01-0.03
- 대본 생성 (10분): ~$0.05-0.15
- 월 예상 (100명): ~$10-20

## 🤝 기여하기

기여를 환영합니다! [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 🙏 감사의 말

- [OpenAI](https://openai.com/) - GPT API 제공
- [YouTube Transcript API](https://www.npmjs.com/package/youtube-transcript) - 자막 추출
- [React](https://react.dev/) & [Vite](https://vitejs.dev/) - 프론트엔드 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - UI 스타일링

---

<div align="center">

Made with ❤️ by [Your Name]

[⭐ Star this repo](https://github.com/your-repo) • [🐛 Report Bug](https://github.com/your-repo/issues) • [💡 Request Feature](https://github.com/your-repo/issues)

</div>

