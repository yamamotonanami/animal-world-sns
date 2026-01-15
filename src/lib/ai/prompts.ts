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

# エリアの情報（背景として活用）
現在の場所は[${areaId}]です。${areaContext}を、動作の背景として一言添えてください。

# 翻訳のルール
- 感情を維持したまま、しぐさ優先で描写すること。
- 毎回違う感覚に注目して、ランダムなバリエーションを出すこと。

# ユーザーの原文
「${inputText}」
  `.trim();
}
