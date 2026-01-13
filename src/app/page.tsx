import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/clerk/utils";
import TimelineClient from "@/components/TimelineClient";
import LandingPage from "@/components/LandingPage";
import { SYSTEM_MESSAGES } from "@/lib/mock-data";
import { ensureSupabaseUser } from "@/lib/supabase/auth-helpers";
import { ANIMAL_DATA, AnimalType } from "@/lib/constants";

export default async function Page() {
  const userId = await getCurrentUserId();
  
  // 1. ログイン済みならユーザー情報を取得
  const user = userId ? await ensureSupabaseUser() : null;

  // 2. 住人登録まで完了しているなら、そのままタイムラインを表示
  if (user && user.nickname) {
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

    return (
      <TimelineClient
        initialPosts={formattedPosts}
        user={user}
        systemMessages={SYSTEM_MESSAGES.town}
        spaceType="town"
        headerTitle="街のタイムライン"
        headerDesc="賑やかな声が聞こえてきます"
        backgroundStyle={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)), url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
        postingUI={{
            modalTitle: "街の広場で、ニュースを届ける",
            inputPlaceholder: "街の住人たちに伝えたいことは？",
            translatingText: "街の喧騒に馴染ませています...",
            submitButton: "街の掲示板にのこす"
        }}
      />
    );
  }

  // 3. ログイン済みだが「住人未登録」の場合、または未ログインの場合
  // 自動リダイレクトを廃止し、LandingPageを表示します。
  // LandingPage内には「住人登録を完了する」ボタンが表示されるようになっています。
  return <LandingPage user={user} />;
}
