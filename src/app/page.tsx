import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/clerk/utils";
import TimelineClient from "@/components/TimelineClient";
import LandingPage from "@/components/LandingPage";
import { SYSTEM_MESSAGES } from "@/lib/mock-data";
import { ensureSupabaseUser } from "@/lib/supabase/auth-helpers";
import { ANIMAL_DATA, AnimalType, AREAS_CONFIG } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const userId = await getCurrentUserId();
  const params = await searchParams;
  const isExplicit = params.explicit === "true";
  
  // 1. ログイン済みならユーザー情報を取得
  const user = userId ? await ensureSupabaseUser() : null;

  // 2. 住人登録まで完了しているなら、そのままタイムラインを表示
  if (user && user.nickname) {
    // 最後のエリアが「街」以外で、かつ明示的な指定がない場合はリダイレクト
    if (!isExplicit && user.last_area && user.last_area !== 'town') {
      const targetPath = AREAS_CONFIG[user.last_area as keyof typeof AREAS_CONFIG]?.path || "/";
      if (targetPath !== "/") {
        redirect(targetPath);
      }
    }

    const supabase = await createClient();
    const { data: posts } = await supabase
      .from("posts")
      .select(`
        *,
        users (id, nickname, animal_types(id, name, sub_type), titles(name, code)),
        reactions (type, user_id)
      `)
      .eq("space_type", "town")
      .order("created_at", { ascending: false });

    const formattedPosts = posts?.map((post: any) => {
      const myReactions = post.reactions.filter((r: any) => r.user_id === user.id);
      const tailActive = myReactions.some((r: any) => r.type === "tail");
      const groomActive = myReactions.some((r: any) => r.type === "groom");
      const stretchActive = myReactions.some((r: any) => r.type === "stretch");

      const tailCount = post.reactions.filter((r: any) => r.type === "tail").length;
      const groomCount = post.reactions.filter((r: any) => r.type === "groom").length;
      const stretchCount = post.reactions.filter((r: any) => r.type === "stretch").length;

      return {
        id: post.id,
        userId: post.users.id,
        nickname: post.users.nickname,
        title: post.users.titles?.name || "No Title",
        animalType: post.users.animal_types?.sub_type || "dog",
        translatedContent: post.translated_content,
        originalContent: post.user_id === user.id ? post.original_content : null,
        spaceType: post.space_type,
        createdAt: post.created_at,
        reactions: {
          tail: { count: tailCount, active: tailActive },
          groom: { count: groomCount, active: groomActive },
          stretch: { count: stretchCount, active: stretchActive },
        },
      };
    }) || [];

    const postsWithSystem = [...formattedPosts];
    const townMessages = SYSTEM_MESSAGES.town || [];
    if (townMessages.length > 0) {
      const randomMsg = townMessages[Math.floor(Math.random() * townMessages.length)];
      const index = Math.floor(Math.random() * (postsWithSystem.length + 1));
      postsWithSystem.splice(index, 0, {
        id: `sys-town-${Date.now()}`,
        isSystem: true,
        content: randomMsg,
        createdAt: new Date().toISOString(),
      } as any);
    }

    const config = AREAS_CONFIG.town;

    return (
      <TimelineClient
        initialPosts={postsWithSystem}
        user={user}
        systemMessages={[]} // サーバー側で混ぜたので空にする
        spaceType={config.id}
        headerTitle={config.headerTitle}
        headerDesc={config.headerDesc}
        backgroundStyle={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)), url('${config.bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
        postingUI={config.postingUI}
      />
    );
  }

  // 3. ログイン済みだが「住人未登録」の場合、または未ログインの場合
  // 自動リダイレクトを廃止し、LandingPageを表示します。
  // LandingPage内には「住人登録を完了する」ボタンが表示されるようになっています。
  return <LandingPage user={user} />;
}
