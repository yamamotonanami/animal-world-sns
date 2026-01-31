import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { AREA_PROMPT_CONTEXTS, AreaId } from '@/lib/constants';

/**
 * ユーザーの原文、動物、エリアから最終的なAIプロンプトを生成する
 */
export async function generateFinalPrompt(inputText: string, animalSubType: string, areaId: string) {
  const supabase = createServiceRoleClient();

  // 1. 動物のテンプレートを取得
  const { data: template } = await supabase
    .from('prompt_templates')
    .select(`
      *,
      animal_types!inner(sub_type)
    `)
    .eq('animal_types.sub_type', animalSubType)
    .single();

  if (!template) {
    // テンプレートがない場合のデフォルト指示
    return `ユーザーの原文「${inputText}」を、[${animalSubType}]らしい簡潔な言葉に翻訳してください。数字は使わず、しぐさを交えてください。`;
  }

  const areaContext = AREA_PROMPT_CONTEXTS[areaId as AreaId] || "";

  // 2. プロンプトの組み立て
  return `
# あなたの役割
${template.system_role}
ユーザーの原文を、情景を交えつつ、あなたの「しぐさ」や「身体感覚」を中心とした言葉に翻訳してください。

# 翻訳の黄金律
- ${template.behavior_instructions}
- ${template.emotional_instructions}
- ${template.constraints}

# 出力例（Few-shot）
${template.few_shot_examples}

# エリアの情報
現在の場所は[${areaId}]です。
エリアのキーワード: ${areaContext}
この場所の空気感や五感（匂い、音、感触）を、可能であればさりげなく表現に混ぜてください。
※無理に情景描写をする必要はありません。自然な流れを優先してください。

# 翻訳のルール
- 感情を維持したまま、しぐさ優先で描写すること。
- 毎回違う感覚に注目して、ランダムなバリエーションを出すこと。
- **上記の出力例を参考に、必ず一文で簡潔に出力すること。**

# ユーザーの原文
「${inputText}」
  `.trim();
}
