# Netlify 배포 가이드

이 문서는 유튜브 대본 생성기를 Netlify에 배포하는 방법을 설명합니다.

## 📋 목차

1. [사전 준비사항](#사전-준비사항)
2. [Netlify 배포](#netlify-배포)
3. [환경 변수 설정](#환경-변수-설정)
4. [트러블슈팅](#트러블슈팅)
5. [비용 및 제한사항](#비용-및-제한사항)

---

## 사전 준비사항

### 1. OpenAI API 키 발급

1. https://platform.openai.com/api-keys 방문
2. 로그인 또는 회원가입
3. "Create new secret key" 클릭
4. API 키 복사 (sk-로 시작)
5. 결제 정보 등록 (사용량 기반 과금)

### 2. GitHub 저장소 생성

```bash
# 로컬 저장소 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: YouTube Script Generator"

# GitHub에서 저장소 생성 후 연결
git remote add origin https://github.com/your-username/your-repo.git

# 푸시
git push -u origin main
```

---

## Netlify 배포

### 방법 1: 웹 UI를 통한 배포 (권장)

#### Step 1: Netlify 계정 생성

1. https://netlify.com 방문
2. GitHub 계정으로 회원가입/로그인

#### Step 2: 새 사이트 생성

1. 대시보드에서 **"Add new site"** 클릭
2. **"Import an existing project"** 선택
3. GitHub 선택
4. 저장소 권한 부여 및 선택

#### Step 3: 빌드 설정 확인

Netlify가 자동으로 `netlify.toml`을 감지합니다:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"
```

**자동 감지되지 않는 경우 수동 설정:**
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

#### Step 4: 배포

1. **"Deploy site"** 클릭
2. 빌드 로그 확인 (2-3분 소요)
3. 배포 완료 후 URL 확인 (예: `random-name-123.netlify.app`)

---

### 방법 2: Netlify CLI를 통한 배포

#### Step 1: Netlify CLI 설치

```bash
npm install -g netlify-cli
```

#### Step 2: 로그인

```bash
netlify login
```

브라우저가 열리면 권한 승인

#### Step 3: 사이트 초기화

```bash
netlify init
```

프롬프트에 따라 설정:
- Create & configure a new site
- Team 선택
- Site name 입력 (선택사항)
- Build command: `npm run build`
- Directory to deploy: `dist`
- Functions directory: `netlify/functions`

#### Step 4: 배포

```bash
# 프로덕션 배포
netlify deploy --prod
```

---

## 환경 변수 설정

### 웹 UI에서 설정

1. Netlify 대시보드에서 사이트 선택
2. **Site settings** → **Environment variables** 클릭
3. **Add a variable** 클릭
4. 다음 변수들을 추가:

| Key | Value | 설명 |
|-----|-------|------|
| `OPENAI_API_KEY` | `sk-...` | OpenAI API 키 (필수) |
| `NODE_ENV` | `production` | 프로덕션 환경 |
| `RATE_LIMIT_WINDOW_MS` | `60000` | 레이트 리미팅 시간 창 |
| `RATE_LIMIT_MAX_REQUESTS` | `30` | 최대 요청 수 |

5. **Save** 클릭
6. 사이트 재배포 (자동 또는 수동)

### CLI에서 설정

```bash
# 환경 변수 추가
netlify env:set OPENAI_API_KEY "sk-your-api-key"
netlify env:set NODE_ENV "production"
netlify env:set RATE_LIMIT_WINDOW_MS "60000"
netlify env:set RATE_LIMIT_MAX_REQUESTS "30"

# 환경 변수 확인
netlify env:list
```

---

## Custom Domain 설정

### 1. 도메인 추가

1. Site settings → Domain management
2. **Add custom domain** 클릭
3. 도메인 입력 (예: `scriptgen.com`)

### 2. DNS 설정

**Netlify DNS 사용 (권장):**
1. Netlify에서 네임서버 확인
2. 도메인 등록업체에서 네임서버 변경
3. DNS 전파 대기 (최대 48시간)

**외부 DNS 사용:**
1. A 레코드 추가: `75.2.60.5`
2. CNAME 레코드 추가: `www` → `your-site.netlify.app`

### 3. HTTPS 설정

Netlify가 자동으로 Let's Encrypt SSL 인증서 발급 (무료)

---

## 로깅 및 모니터링

### 함수 로그 확인

1. Netlify 대시보드에서 사이트 선택
2. **Functions** 탭 클릭
3. 각 함수 클릭하여 로그 확인

### 실시간 로그

```bash
netlify dev
```

로컬에서 Netlify Functions 환경을 에뮬레이트

### Analytics (유료)

Netlify Analytics를 활성화하면:
- 페이지뷰
- 대역폭 사용량
- 함수 실행 통계
- 에러율

---

## 트러블슈팅

### 빌드 실패

**문제:** Build command failed

**해결책:**
```bash
# 로컬에서 빌드 테스트
npm install
npm run build

# 의존성 확인
npm audit fix
```

### 함수 타임아웃

**문제:** Function execution timed out

**원인:**
- Netlify Functions는 10초 타임아웃 (무료)
- Pro 플랜은 26초

**해결책:**
1. 참조 콘텐츠 길이 줄이기
2. 요약 기능 활용
3. Pro 플랜 업그레이드 고려

### CORS 에러

**문제:** CORS policy blocked

**해결책:**
각 함수에 CORS 헤더 확인:
```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
```

### 환경 변수 미적용

**문제:** OPENAI_API_KEY not found

**해결책:**
1. 환경 변수 재확인
2. 사이트 재배포:
   ```bash
   netlify deploy --prod
   ```
3. 함수 로그에서 변수 확인

### 파일 업로드 실패

**문제:** File upload not working

**원인:** Multipart form data 파싱 문제

**해결책:**
- `parse-multipart-data` 패키지 설치 확인
- 함수 코드에서 boundary 파싱 확인
- 파일 크기 제한 확인 (Netlify: 6MB body 제한)

---

## 비용 및 제한사항

### Netlify 무료 티어

| 항목 | 제한 |
|------|------|
| 빌드 시간 | 300분/월 |
| 대역폭 | 100GB/월 |
| Functions 실행 시간 | 125,000 요청/월 |
| 함수 타임아웃 | 10초 |
| 동시 빌드 | 1개 |

### Netlify Pro ($19/월)

| 항목 | 제한 |
|------|------|
| 빌드 시간 | 1,000분/월 |
| 대역폭 | 400GB/월 |
| Functions 실행 시간 | 무제한 |
| 함수 타임아웃 | 26초 |
| 동시 빌드 | 3개 |

### OpenAI API 비용

GPT-4 기준:
- Input: $0.03 / 1K tokens
- Output: $0.06 / 1K tokens

**예상 비용:**
- 제목 생성: ~$0.01-0.03
- 대본 생성 (10분): ~$0.05-0.15
- 월 100명 사용: ~$10-30

### 비용 절감 팁

1. **GPT-3.5-turbo 사용**
   ```javascript
   model: 'gpt-3.5-turbo'  // 50% 비용 절감
   ```

2. **요약 최적화**
   - 긴 텍스트는 미리 요약
   - 불필요한 토큰 제거

3. **캐싱 전략**
   - 동일 콘텐츠 재사용 감지
   - 로컬 스토리지 활용

4. **레이트 리미팅**
   - 남용 방지
   - 비용 예측 가능

---

## 배포 체크리스트

배포 전 확인사항:

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] OpenAI API 키 발급 완료
- [ ] GitHub 저장소 생성 및 코드 푸시
- [ ] Netlify 계정 생성
- [ ] 환경 변수 설정 (`OPENAI_API_KEY` 필수)
- [ ] 빌드 로그 확인
- [ ] 배포된 사이트에서 각 기능 테스트
  - [ ] 유튜브 URL 자막 추출
  - [ ] 파일 업로드
  - [ ] 제목 생성
  - [ ] 대본 생성 (5/10/15분)
  - [ ] 다운로드 기능
- [ ] 에러 로깅 확인
- [ ] Custom domain 설정 (선택)
- [ ] HTTPS 작동 확인

---

## 추가 최적화

### 1. 빌드 속도 향상

**netlify.toml 추가:**
```toml
[build]
  command = "npm run build"
  publish = "dist"
  
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.images]
  compress = true
```

### 2. 캐싱 전략

**_headers 파일 추가:**
```
/static/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable
```

### 3. 에러 추적

**Sentry 통합:**
```bash
npm install @sentry/browser

# netlify.toml에 추가
[build.environment]
  SENTRY_DSN = "your-sentry-dsn"
```

---

## 지원

### 문제 발생 시

1. **Netlify Support**
   - https://answers.netlify.com/
   - support@netlify.com

2. **GitHub Issues**
   - 프로젝트 저장소의 Issues 탭

3. **커뮤니티**
   - Discord: Netlify Community
   - Forum: Netlify Support Forum

---

## 다음 단계

배포 완료 후:

1. ✅ 프로덕션 환경 테스트
2. 📊 Analytics 설정
3. 🔔 에러 알림 설정
4. 📈 사용량 모니터링
5. 🎯 사용자 피드백 수집

---

**축하합니다! 🎉** 

프로젝트가 성공적으로 배포되었습니다!

배포된 URL: https://your-site.netlify.app
