# 기여 가이드

이 프로젝트에 기여해주셔서 감사합니다! 이 문서는 기여 방법을 설명합니다.

## 시작하기

1. **저장소 포크**
   ```bash
   # GitHub에서 Fork 버튼 클릭
   git clone https://github.com/YOUR_USERNAME/vibe-1126-acorn-gpt-youtube-script.git
   ```

2. **개발 환경 설정**
   ```bash
   cd vibe-1126-acorn-gpt-youtube-script
   npm install
   cp .env.template .env
   # .env 파일에 OpenAI API 키 입력
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

## 기여 프로세스

1. **이슈 확인**
   - 기존 이슈를 확인하거나 새 이슈를 생성합니다
   - 이슈에 댓글을 달아 작업 의사를 밝힙니다

2. **브랜치 생성**
   ```bash
   git checkout -b feature/your-feature-name
   # 또는
   git checkout -b fix/your-bug-fix
   ```

3. **코드 작성**
   - 코드 스타일 가이드를 따릅니다
   - 커밋 메시지 컨벤션을 준수합니다

4. **테스트**
   ```bash
   npm run build  # 빌드 확인
   ```

5. **커밋 & 푸시**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

6. **Pull Request 생성**
   - GitHub에서 Pull Request를 생성합니다
   - 변경 사항을 명확히 설명합니다

## 코드 스타일

### JavaScript/JSX
- ESLint 규칙을 따릅니다
- Prettier로 포맷팅합니다
- 의미있는 변수명을 사용합니다

### 커밋 메시지
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가
- `chore`: 빌드, 설정 변경

**예시:**
```
feat: add support for PDF export

- Add pdf generation using jsPDF
- Update download options UI
- Add export to PDF button

Closes #123
```

## 이슈 리포트

버그 리포트 시 다음 정보를 포함해주세요:

1. **환경**
   - OS
   - Node.js 버전
   - 브라우저

2. **재현 단계**
   - 상세한 단계별 설명

3. **예상 동작**
   - 어떻게 동작해야 하는지

4. **실제 동작**
   - 실제로 어떻게 동작하는지

5. **스크린샷** (가능한 경우)

## 기능 제안

새로운 기능을 제안할 때:

1. **문제 설명**: 어떤 문제를 해결하나요?
2. **제안 솔루션**: 어떻게 해결할 건가요?
3. **대안**: 다른 방법은 없나요?
4. **영향도**: 기존 기능에 영향을 주나요?

## 개발 팁

### 로컬 테스트
```bash
# 프론트엔드만
npm run client:dev

# 백엔드만
npm run server:dev

# 둘 다
npm run dev
```

### 로그 확인
```bash
# 서버 로그는 콘솔에 출력됩니다
# Pino pretty 포맷으로 가독성 향상
```

### API 테스트
```bash
# curl 또는 Postman 사용
curl -X POST http://localhost:3001/api/generate-titles \
  -H "Content-Type: application/json" \
  -d '{"referenceContent":"test content"}'
```

## 주의사항

1. **API 키 노출 금지**
   - .env 파일은 절대 커밋하지 마세요
   - 코드에 직접 키를 하드코딩하지 마세요

2. **대용량 파일**
   - 대용량 파일은 Git LFS 사용
   - 불필요한 바이너리 파일 제거

3. **의존성 추가**
   - 꼭 필요한 경우에만 추가
   - package.json에 명시

## 질문이나 도움이 필요하신가요?

- GitHub Issues에서 질문하세요
- 기존 이슈를 먼저 검색해보세요

감사합니다! 🎉

