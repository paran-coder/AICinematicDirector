export const demoProject = {
  id: "demo",
  name: "The Last Cassette",
  story: "비 오는 서울에서 한 여성이 오래된 카세트 플레이어를 발견한다. 그리고 그 카세트는 잊었던 기억을 다시 불러온다.",
  duration: 30,
  aspectRatio: "16:9",
  genre: "시네마틱 드라마",
  visualDirection: "시네마틱 리얼리즘 · 차가운 청색 + 따뜻한 텅스텐",
  character: {
    id: "mina",
    name: "Mina",
    age: 32,
    summary: "한국인 여성 · 짧은 검은 보브컷 · 갈색 눈",
    traits: ["마른 체형", "왼쪽 눈 아래 작은 점", "은색 목걸이"],
    states: ["젖음", "피곤함", "부상"],
  },
  scenes: [
    { id: "scene-01", order: 1, title: "비 오는 골목", description: "Mina가 비 오는 골목을 걷는다." },
    { id: "scene-02", order: 2, title: "발견", description: "Mina가 오래된 상점을 발견한다." },
    { id: "scene-03", order: 3, title: "오래된 상점", description: "Mina가 상점에 들어가 카세트 플레이어를 발견한다." },
    { id: "scene-04", order: 4, title: "기억", description: "카세트가 오래된 기억을 불러온다." },
  ],
  shots: [
    { id: "shot-01", order: 1, title: "와이드 샷", description: "상점 내부 전경", duration: 5, image: "/fixtures/shot-wide.jpg" },
    { id: "shot-02", order: 2, title: "미디엄 샷", description: "Mina가 뒤를 돌아본다.", duration: 8, image: "/fixtures/shot-medium.jpg" },
    { id: "shot-03", order: 3, title: "인서트 샷", description: "카세트 플레이어", duration: 6, image: "/fixtures/shot-insert.jpg" },
    { id: "shot-04", order: 4, title: "클로즈업 샷", description: "Mina의 얼굴", duration: 8, image: "/fixtures/shot-closeup.jpg" },
  ],
} as const;
