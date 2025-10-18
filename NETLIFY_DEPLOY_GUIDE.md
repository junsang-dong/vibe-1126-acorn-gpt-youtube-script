# 🚀 Netlify 빠른 배포 가이드

## 준비물 ✅

- [x] OpenAI API 키 ([발급받기](https://platform.openai.com/api-keys))
- [x] GitHub 계정
- [x] Netlify 계정 (무료)

---

## 5분 안에 배포하기

### 1단계: GitHub에 코드 푸시 (2분)

```bash
# Git 초기화
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: YouTube Script Generator"

# GitHub에서 새 저장소 생성 후 연결
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 푸시
git push -u origin main
```

### 2단계: Netlify에 배포 (2분)

1. https://app.netlify.com 접속 및 로그인
2. **"Add new site"** → **"Import an existing project"** 클릭
3. **GitHub** 선택 및 권한 부여
4. 저장소 선택
5. 빌드 설정 확인 (자동 감지):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
6. **"Deploy site"** 클릭

### 3단계: 환경 변수 설정 (1분)

1. 배포 완료 후 **"Site settings"** 클릭
2. **"Environment variables"** 클릭
3. **"Add a variable"** 클릭
4. 추가:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-your-api-key-here`
5. **"Save"** 클릭
6. **"Deploys"** → **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## ✅ 배포 확인

배포가 완료되면 (약 2-3분):

1. ✅ 할당된 URL 확인 (예: `your-site-name.netlify.app`)
2. ✅ 사이트 접속
3. ✅ 기능 테스트:
   - 파일 업로드
   - 제목 생성
   - 대본 생성

---

## 🎯 커스텀 도메인 설정 (선택사항)

1. **"Domain settings"** 클릭
2. **"Add custom domain"** 클릭
3. 도메인 입력 및 DNS 설정
4. HTTPS 자동 활성화

---

## 🔧 트러블슈팅

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm install
npm run build
```

### Functions 오류
- Netlify Functions 로그 확인
- 환경 변수 재확인
- 사이트 재배포

### CORS 에러
- 각 함수에 CORS 헤더 확인
- 브라우저 콘솔에서 에러 메시지 확인

---

## 📊 모니터링

**Functions 로그 확인:**
1. Netlify 대시보드
2. **"Functions"** 탭
3. 각 함수 클릭 → 로그 확인

**실시간 로그:**
```bash
netlify dev
```

---

## 💰 비용

### Netlify (무료 티어)
- ✅ 100GB 대역폭/월
- ✅ 125,000 함수 실행/월
- ✅ 300분 빌드/월

### OpenAI API
- 대본 1개당: $0.05-0.15
- 월 100개: $5-15

---

## 🎉 완료!

축하합니다! 이제 전 세계 어디서나 접속 가능한 AI 대본 생성기가 준비되었습니다!

**다음 단계:**
- ✅ Custom domain 설정
- ✅ Analytics 활성화
- ✅ 사용자 피드백 수집

---

**도움이 필요하신가요?**

📖 [전체 배포 가이드](DEPLOYMENT.md)
🐛 [GitHub Issues](https://github.com/your-repo/issues)
💬 [Netlify Community](https://answers.netlify.com)

