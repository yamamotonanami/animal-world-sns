export const ANIMAL_DATA = {
  dog: {
    name: "イヌ",
    emoji: "🐕",
    description: "あなたは、素直で温かい心の持ち主。誰かの喜びを自分のことのように喜べる、森のムードメーカーです。",
  },
  cat: {
    name: "ネコ",
    emoji: "🐈",
    description: "あなたは、自分を大切にできる自由な魂の持ち主。静かな時間を愛し、独自の視点で世界を眺めています。",
  },
  rabbit: {
    name: "うさぎ",
    emoji: "🐇",
    description: "あなたは、繊細で優しい感性の持ち主。小さな変化に気づき、周りを和ませる不思議な魅力があります。",
  },
  beaver: {
    name: "ビーバー",
    emoji: "🦫",
    description: "あなたは、コツコツと積み上げる努力家。自分の居心地の良い場所を作るのが得意な、頼れる存在です。",
  },
} as const;

export type AnimalType = keyof typeof ANIMAL_DATA;
