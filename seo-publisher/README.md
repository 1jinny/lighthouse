# SEO Article Publisher — 블랑드림치과

**블랑드림치과** 마케팅용 콘텐츠 제작 도구.
글 스타일은 **블랑쉬치과 블로그**를 벤치마크로 삼는다.

## 결과물 (글 1건당 4종 세트)

| 채널 | 형식 | 비고 |
|---|---|---|
| 네이버 블로그 | 본문 (제목, 소제목, 해시태그) | C-Rank/DIA 고려: 경험·정보 중심, 키워드 자연 배치 |
| 구글 블로그(Blogger) | HTML 본문 + 메타 설명 | 검색 의도 기반 헤딩 구조(H2/H3), 메타 디스크립션 |
| 썸네일 | 1080x1080 PNG | `scripts/make-thumbnail.js`로 생성 |
| 스레드(Threads) | 500자 내 후킹 포스트 | 첫 줄 후킹 + 핵심 요약 + 블로그 유도 |

## 구조

```
seo-publisher/
├── config/
│   ├── clinic-profile.json      # 블랑드림치과 정보 (빈 필드 채워야 함)
│   └── benchmark-profile.json   # 블랑쉬치과 (스타일 벤치마크)
├── templates/
│   └── thumbnail.html           # 썸네일 디자인 템플릿 (1080x1080)
├── scripts/
│   └── make-thumbnail.js        # 썸네일 PNG 렌더러 (playwright-core)
└── articles/
    ├── input/                   # 원본(참고) 글
    └── output/
        ├── naver/               # 네이버 블로그용 글
        ├── google/              # 구글 블로그용 글
        ├── threads/             # 스레드 포스트
        └── thumbnails/          # 썸네일 PNG
```

## 썸네일 생성

```bash
cd seo-publisher && npm install
node scripts/make-thumbnail.js \
  --title "무삭제 라미네이트,\n치아 손상 없이 가능할까?" \
  --subtitle "삭제량 0mm 라미네이트의 조건" \
  --badge "치아성형" \
  --out articles/output/thumbnails/laminate.png
```

## 작업 순서

1. 참고 글을 `articles/input/`에 넣는다 (또는 채팅으로 전달)
2. 블랑드림치과 프로필 + 벤치마크 톤 기준으로 채널별 글 생성 → `articles/output/`
3. 썸네일 텍스트 뽑아서 PNG 생성
4. 발행: 네이버 블로그는 공식 API가 없어 수동 업로드(글 복붙), Blogger는 API 발행 가능, 스레드는 Threads API 발행 가능

## 주의

- 의료광고법 준수: 효과 보장·최상급 표현("최고", "100%", "완치") 금지, 치료 전후 사진은 조건 명시
- `config/clinic-profile.json`의 병원 정보(주소, 전화, 블로그 URL 등)를 채워야 글에 자동 반영됨
