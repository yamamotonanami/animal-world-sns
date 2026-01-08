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
    reactions: { 
      tail: { count: 12, active: true }, 
      groom: { count: 5, active: false }, 
      stretch: { count: 8, active: true } 
    },
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
    reactions: { 
      tail: { count: 3, active: false }, 
      groom: { count: 15, active: true }, 
      stretch: { count: 2, active: false } 
    },
  },
  {
    id: "3",
    userId: "u3",
    nickname: "みるく",
    title: "震えるしっぽの冒険家",
    animalType: "rabbit",
    translatedContent: "湖のほとりで、キラキラ光る水面を眺めていた。心がしっとり落ち着くね。",
    originalContent: "湖に来ました。綺麗で落ち着きます。",
    spaceType: "lake",
    createdAt: new Date().toISOString(),
    reactions: { 
      tail: { count: 0, active: false }, 
      groom: { count: 4, active: false }, 
      stretch: { count: 21, active: true } 
    },
  },
  {
    id: "4",
    userId: "u4",
    nickname: "ごん",
    title: "日向ぼっこの達人",
    animalType: "beaver",
    translatedContent: "今日は流木を集めて、立派なダムを造ったよ。少し肩が凝ったけれど、良い気分だ。",
    originalContent: "仕事頑張りました。疲れましたが達成感あります。",
    spaceType: "lake",
    createdAt: new Date().toISOString(),
    reactions: { 
      tail: { count: 18, active: true }, 
      groom: { count: 2, active: false }, 
      stretch: { count: 1, active: false } 
    },
  },
];

export const MOCK_USERS = [
  { id: "u1", name: "ぽち", animal: "dog", title: "はじめての足跡" },
  { id: "u2", name: "たま", animal: "cat", title: "窓辺の警備隊長" },
  { id: "u3", name: "みるく", animal: "rabbit", title: "震えるしっぽの冒険家" },
  { id: "u4", name: "ごん", animal: "beaver", title: "日向ぼっこの達人" },
];
