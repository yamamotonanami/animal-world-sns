export const ANIMAL_DATA = {
  dog: {
    name: "イヌ",
    emoji: "🐕",
    iconUrl: "/animals/dog.png",
    description: "あなたは、素直で温かい心の持ち主。誰かの喜びを自分のことのように喜べる、森のムードメーカーです。",
  },
  cat: {
    name: "ネコ",
    emoji: "🐈",
    iconUrl: "/animals/cat.png",
    description: "あなたは、自分を大切にできる自由な魂の持ち主。静かな時間を愛し、独自の視点で世界を眺めています。",
  },
  rabbit: {
    name: "うさぎ",
    emoji: "🐇",
    iconUrl: "/animals/rabbit.png",
    description: "あなたは、繊細で優しい感性の持ち主。小さな変化に気づき、周りを和ませる不思議な魅力があります。",
  },
  beaver: {
    name: "ビーバー",
    emoji: "🦫",
    iconUrl: "/animals/beaver.png",
    description: "あなたは、コツコツと積み上げる努力家。自分の居心地の良い場所を作るのが得意な、頼れる存在です。",
  },
} as const;

export type AnimalType = keyof typeof ANIMAL_DATA;

// 各エリア（バイオーム）の設定を一括管理
export const AREAS_CONFIG = {
  town: {
    id: "town" as const,
    name: "街",
    path: "/",
    headerTitle: "街のタイムライン",
    headerDesc: "賑やかな声が聞こえてきます",
    // public/backgrounds/town.jpg を参照
    bgImage: "/backgrounds/town.jpg",
    postingUI: {
      modalTitle: "街の広場で、ニュースを届ける",
      inputPlaceholder: "街の住人たちに伝えたいことは？",
      translatingText: "街の喧騒に馴染ませています...",
      submitButton: "街の掲示板にのこす"
    }
  },
  forest: {
    id: "forest" as const,
    name: "森",
    path: "/forest",
    headerTitle: "森のタイムライン",
    headerDesc: "木々のささやきに耳を澄ませて",
    // public/backgrounds/forest.jpg を参照
    bgImage: "/backgrounds/forest.jpg",
    postingUI: {
      modalTitle: "木漏れ日の中で、つぶやく",
      inputPlaceholder: "木々に溶け込むような、今の気分は？",
      translatingText: "森のささやきに変えています...",
      submitButton: "風にのせて森へ放つ"
    }
  },
  lake: {
    id: "lake" as const,
    name: "湖",
    path: "/lake",
    headerTitle: "湖のタイムライン",
    headerDesc: "静かな水面に心が映ります",
    // public/backgrounds/lake.jpg を参照
    bgImage: "/backgrounds/lake.jpg",
    postingUI: {
      modalTitle: "静かな湖畔で、波紋を広げる",
      inputPlaceholder: "水面に映る、あなたの今の心境は？",
      translatingText: "湖の静寂に溶け込ませています...",
      submitButton: "水面にそっと浮かべる"
    }
  }
};

export type AreaId = keyof typeof AREAS_CONFIG;

// プロンプトで使用するエリアごとの情景キーワード
export const AREA_PROMPT_CONTEXTS = {
  town: "活気ある喧騒、石畳の硬さ、おいしそうな匂い",
  forest: "湿った土の匂い、木々のざわめき、木漏れ日の温かさ",
  lake: "水の匂い、静寂、ひんやりとした空気"
} as const;
