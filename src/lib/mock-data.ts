export const ANIMAL_TYPES = [
  { id: "dog", name: "イヌ", subTypes: ["柴犬", "ポメラニアン", "ハスキー"] },
  { id: "cat", name: "ネコ", subTypes: ["アメリカンショートヘアー", "三毛猫", "スコティッシュフォールド"] },
  { id: "rabbit", name: "うさぎ", subTypes: ["ネザーランドドワーフ", "ホーランドロップ"] },
  { id: "beaver", name: "ビーバー", subTypes: ["カナダビーバー"] },
];

export const TITLES = {
  initial: [
    "ふわふわの新参者",
    "ぴかぴかの新入り肉球",
    "震えるしっぽの冒険家",
  ],
  unlocked: [
    { id: "first-step", name: "はじめての足跡", condition: "最初の投稿を完了する" },
    { id: "sun-master", name: "日向ぼっこの達人", condition: "晴れた日の日中に投稿" },
    { id: "night-runner", name: "真夜中の大運動家", condition: "深夜に投稿" },
  ],
};

export const MOCK_POSTS = [
  {
    id: "1",
    userId: "u1",
    nickname: "ぽち",
    title: "はじめての足跡",
    animalType: "dog",
    translatedContent: "今日は群れの集まりが長かった。日陰で少し休みたくなった。",
    originalContent: "今日は会議が多くて疲れました",
    spaceType: "forest",
    createdAt: new Date().toISOString(),
    reactions: { tail: true, groom: false, stretch: true },
  },
  {
    id: "2",
    userId: "u2",
    nickname: "たま",
    title: "窓辺の警備隊長",
    animalType: "cat",
    translatedContent: "窓の外に不思議な羽の友達がいた。じっと見守るのが今日の仕事。",
    originalContent: "ベランダに鳥が来てた。ずっと見てた。",
    spaceType: "forest",
    createdAt: new Date().toISOString(),
    reactions: { tail: false, groom: true, stretch: false },
  },
];

