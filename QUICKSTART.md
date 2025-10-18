# 🚀 빠른 시작 가이드

5분 안에 프로젝트를 실행해보세요!

## 1단계: 환경 설정 (2분)

### 1.1 Node.js 설치 확인
```bash
node --version  # v18 이상 필요
npm --version
```

Node.js가 없다면: https://nodejs.org 에서 다운로드

### 1.2 OpenAI API 키 발급
1. https://platform.openai.com/api-keys 방문
2. 로그인 / 회원가입
3. "Create new secret key" 클릭
4. API 키 복사 (sk-로 시작)

⚠️ **중요**: API 키는 절대 공유하지 마세요!

## 2단계: 프로젝트 설치 (2분)

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 파일 생성
cp .env.template .env

# 3. .env 파일 편집 (텍스트 에디터로)
# OPENAI_API_KEY=sk-your-api-key-here 에 복사한 키 입력
```

**macOS/Linux:**
```bash
echo "OPENAI_API_KEY=sk-your-api-key-here" > .env
echo "PORT=3001" >> .env
echo "NODE_ENV=development" >> .env
```

**Windows:**
```cmd
echo OPENAI_API_KEY=sk-your-api-key-here > .env
echo PORT=3001 >> .env
echo NODE_ENV=development >> .env
```

## 3단계: 실행 (1분)

```bash
# 개발 서버 시작 (프론트엔드 + 백엔드 동시 실행)
npm run dev
```

✅ **성공!** 브라우저가 자동으로 열립니다.
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3001

## 4단계: 첫 대본 생성해보기

### 옵션 1: 예제 파일 사용
1. 브라우저에서 http://localhost:5173 열기
2. "파일 업로드" 탭 선택
3. `example-transcript.txt` 파일 업로드
4. "다음 단계로" 클릭
5. 제목 선택
6. 길이 선택 (10분 추천)
7. "대본 생성 시작" 클릭

### 옵션 2: 유튜브 URL 사용
1. 자막이 있는 유튜브 영상 URL 복사
2. "유튜브 URL" 탭에 붙여넣기
3. 나머지 단계 진행

## 문제 해결

### ❌ "OPENAI_API_KEY not set"
→ .env 파일을 확인하고 API 키를 올바르게 입력했는지 확인

### ❌ "Port 3001 already in use"
→ 다른 프로그램이 3001 포트를 사용 중
```bash
# .env 파일에서 PORT 변경
PORT=3002
```

### ❌ "Module not found"
→ 의존성 재설치
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ 페이지가 로드되지 않음
→ 방화벽 확인 또는 브라우저 캐시 삭제

## 다음 단계

- 📖 [사용 가이드](USAGE_GUIDE.md) - 자세한 사용법
- 🏗️ [아키텍처 문서](ARCHITECTURE.md) - 시스템 구조
- 🚀 [Netlify 배포 가이드](DEPLOYMENT.md) - 프로덕션 배포

## 🚀 Netlify에 배포하기

### 1. GitHub 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Netlify 연결
1. https://app.netlify.com 접속
2. "Add new site" 클릭
3. GitHub 저장소 연결
4. 빌드 설정 자동 감지
5. Deploy 클릭

### 3. 환경 변수 설정
- Site settings → Environment variables
- `OPENAI_API_KEY` 추가

✅ **완료!** 몇 분 안에 배포됩니다!

## 비용 안내

OpenAI API는 사용량 기반 과금입니다:
- 제목 생성: ~$0.01-0.03
- 대본 생성 (10분): ~$0.05-0.15

💡 **팁**: 처음에는 5분 길이로 테스트하세요!

## 도움이 필요하신가요?

- 📝 [GitHub Issues](https://github.com/your-repo/issues)
- 📧 이메일: support@example.com

---

**즐거운 콘텐츠 제작 되세요! 🎬**

