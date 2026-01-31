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
    { id: "first-step", name: "はじめての足跡", condition: "街のタイムラインで初めて投稿する" },
    { id: "lake-visitor", name: "湖のほとりで一休み", condition: "湖のタイムラインに初めて投稿する" },
    { id: "sun-master", name: "日向ぼっこの達人", condition: "晴れた日の日中（10〜15時）に累計3回投稿する" },
    { id: "night-runner", name: "真夜中の大運動家", condition: "深夜（1〜4時）に累計3回投稿する" },
    { id: "grooming-artist", name: "換毛期の芸術家", condition: "「毛づくろい」を累計5回行う" },
    { id: "mofumofu-essence", name: "もふもふの体現者", condition: "「しっぽ」を累計5回行う" },
    { id: "window-guard", name: "窓辺の警備隊長", condition: "「のび」を累計5回行う" },
    { id: "forest-guardian", name: "森の番人", condition: "「森」への累計投稿数が10回を超える" },
  ],
};

export const MOCK_POSTS = [
  {
    id: "t1",
    userId: "u1",
    nickname: "ぽち",
    title: "はじめての足跡",
    animalType: "dog",
    translatedContent: "街の広場は今日も活気があるね。誰かが落としたクッキーの匂いがする。",
    originalContent: "街に来ました。賑やかですね。",
    spaceType: "town",
    createdAt: new Date().toISOString(),
    reactions: { 
      tail: { count: 12, active: true }, 
      groom: { count: 5, active: false }, 
      stretch: { count: 8, active: true } 
    },
  },
  {
    id: "t2",
    userId: "u2",
    nickname: "たま",
    title: "窓辺の警備隊長",
    animalType: "cat",
    translatedContent: "石畳が太陽に温められて、歩くと肉球が少しだけ温かいよ。お昼寝に最高の場所を見つけた。",
    originalContent: "地面が温かくて気持ちいいです。",
    spaceType: "town",
    createdAt: new Date().toISOString(),
    reactions: { 
      tail: { count: 3, active: false }, 
      groom: { count: 15, active: true }, 
      stretch: { count: 2, active: false } 
    },
  },
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

export const SYSTEM_MESSAGES = {
  town: [
    "中央通りの交通渋滞：今日は荷馬車が多いみたい。ゆっくり歩こう。",
    "アイスクリーム屋の行列：甘い匂いに誘われて、広場にみんなが集まっているよ。",
    "時計塔の鐘：お昼の合図が響き渡った。そろそろお腹が空く時間だね。",
    "街角の音楽家：誰かが奏でるメロディに合わせて、しっぽを振るイヌたちがいるよ。"
  ],
  forest: [
    "今夜の月明かり予報：今夜はとっても明るい月が出るよ。お散歩に最適だね。",
    "木の実の収穫時期：西の森でどんぐりがたくさん落ちているよ。冬の準備を始めよう。",
    "そよ風の便り：遠くの森から、春の匂いが運ばれてきたみたい。",
    "静かな雨：葉っぱを叩く雨音が、心地よいリズムを奏でているよ。"
  ],
  lake: [
    "水位の変化：雨のおかげで、湖の水が少し増えたみたい。魚たちが嬉しそうだ。",
    "迷い込んだ渡り鳥の情報：北の国から珍しい鳥が遊びに来ているよ。挨拶しに行こう。",
    "水面のキラキラ：太陽の光が反射して、湖が宝石のように輝いているよ。",
    "静寂の霧：今朝の湖は深い霧に包まれている。神秘的な雰囲気だね。"
  ]
};
