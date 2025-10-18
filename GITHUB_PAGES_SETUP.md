# GitHub Pages 설정 가이드

## 🚀 GitHub Pages 활성화 방법

### 1단계: GitHub 저장소 설정

1. **GitHub 저장소 접속**
   - https://github.com/junsang-dong/vibe-1126-acorn-gpt-youtube-script

2. **Settings 탭 클릭**
   - 저장소 상단 메뉴에서 "Settings" 클릭

3. **Pages 섹션 찾기**
   - 왼쪽 사이드바에서 "Pages" 클릭

4. **Source 설정**
   - Source: "GitHub Actions" 선택
   - 자동으로 GitHub Actions 워크플로우가 실행됩니다

### 2단계: 배포 확인

1. **Actions 탭 확인**
   - 저장소 상단 메뉴에서 "Actions" 클릭
   - "Deploy to GitHub Pages" 워크플로우 실행 확인

2. **배포 완료 대기**
   - 약 2-3분 소요
   - 초록색 체크마크가 나타나면 완료

### 3단계: 웹사이트 접속

배포 완료 후 다음 URL로 접속:
**https://junsang-dong.github.io/vibe-1126-acorn-gpt-youtube-script/**

---

## 🔧 문제 해결

### Actions가 실행되지 않는 경우
1. Settings → Actions → General
2. "Allow all actions and reusable workflows" 선택
3. Save 클릭

### 배포 실패하는 경우
1. Actions 탭에서 실패한 워크플로우 클릭
2. 로그 확인하여 오류 원인 파악
3. 필요시 코드 수정 후 재푸시

### 웹사이트가 로드되지 않는 경우
1. 브라우저 캐시 삭제 (Ctrl+F5 / Cmd+Shift+R)
2. 몇 분 후 다시 시도
3. GitHub Pages 상태 확인

---

## 📱 웹앱 사용법

### 로컬 개발
```bash
npm run dev
# http://localhost:5173
```

### GitHub Pages
- **URL**: https://junsang-dong.github.io/vibe-1126-acorn-gpt-youtube-script/
- **특징**: 정적 파일만 제공 (API 기능은 Netlify Functions 필요)

---

## 🌐 Netlify 배포 (권장)

GitHub Pages는 정적 파일만 제공하므로, API 기능을 사용하려면 Netlify 배포를 권장합니다:

1. **Netlify 접속**: https://app.netlify.com
2. **GitHub 연결**: 저장소 연결
3. **자동 배포**: 코드 푸시 시 자동 배포
4. **API 기능**: Netlify Functions로 백엔드 API 제공

자세한 내용은 [NETLIFY_DEPLOY_GUIDE.md](NETLIFY_DEPLOY_GUIDE.md) 참고

---

## ✅ 완료 체크리스트

- [x] GitHub 저장소 생성
- [x] 코드 업로드
- [x] GitHub Actions 워크플로우 설정
- [x] Vite base path 설정
- [ ] GitHub Pages 활성화 (수동 설정 필요)
- [ ] 웹사이트 접속 확인

---

**축하합니다! 🎉**

이제 전 세계 어디서나 접속 가능한 웹앱이 완성되었습니다!
