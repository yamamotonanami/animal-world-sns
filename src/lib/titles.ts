import { TITLES } from "./mock-data";

export interface UserData {
  name: string;
  animal: string;
  title: string;
  unlockedTitles: string[];
  postCount: number;
  forestPostCount: number;
  lakePostCount: number;
  reactionTailCount: number;
  reactionGroomCount: number;
  reactionStretchCount: number;
}

export const TITLE_CONDITIONS = [
  {
    id: "first-step",
    check: (user: UserData, spaceType: string, isReaction?: boolean) => !isReaction && spaceType === "forest" && user.forestPostCount + 1 >= 1,
  },
  {
    id: "lake-visitor",
    check: (user: UserData, spaceType: string, isReaction?: boolean) => !isReaction && spaceType === "lake" && (user.lakePostCount + 1 >= 1),
  },
  {
    id: "sun-master",
    check: (user: UserData, _spaceType: string, isReaction?: boolean) => {
      if (isReaction) return false;
      const hour = new Date().getHours();
      return (hour >= 10 && hour <= 15) && (user.postCount + 1 >= 3);
    },
  },
  {
    id: "night-runner",
    check: (user: UserData, _spaceType: string, isReaction?: boolean) => {
      if (isReaction) return false;
      const hour = new Date().getHours();
      return (hour >= 1 && hour <= 4) && (user.postCount + 1 >= 3);
    },
  },
  {
    id: "grooming-artist",
    check: (user: UserData, _spaceType: string, isReaction?: boolean, reactionType?: string) => {
      return isReaction === true && reactionType === "groom" && (user.reactionGroomCount + 1 >= 5);
    },
  },
  {
    id: "mofumofu-essence",
    check: (user: UserData, _spaceType: string, isReaction?: boolean, reactionType?: string) => {
      return isReaction === true && reactionType === "tail" && (user.reactionTailCount + 1 >= 5);
    },
  },
  {
    id: "window-guard",
    check: (user: UserData, _spaceType: string, isReaction?: boolean, reactionType?: string) => {
      return isReaction === true && reactionType === "stretch" && (user.reactionStretchCount + 1 >= 5);
    },
  },
  {
    id: "forest-guardian",
    check: (user: UserData, spaceType: string, isReaction?: boolean) => {
      if (isReaction) return false;
      const count = spaceType === "forest" ? user.forestPostCount + 1 : user.forestPostCount;
      return count >= 10;
    },
  }
];

export function getNewUnlockedTitles(
  user: UserData, 
  spaceType: string, 
  isReaction?: boolean, 
  reactionType?: string
): { id: string, name: string }[] {
  const newlyUnlocked: { id: string, name: string }[] = [];
  
  TITLE_CONDITIONS.forEach(cond => {
    // すでに解放済みの場合はスキップ
    if (user.unlockedTitles?.includes(cond.id)) return;
    
    // 条件チェック
    if (cond.check(user, spaceType, isReaction, reactionType)) {
      const titleInfo = TITLES.unlocked.find(t => t.id === cond.id);
      if (titleInfo) {
        newlyUnlocked.push({ id: titleInfo.id, name: titleInfo.name });
      }
    }
  });
  
  return newlyUnlocked;
}
