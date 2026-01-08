# データベース設計

## 1. ER図

```mermaid
erDiagram
    USERS ||--o1 ANIMAL_PROFILES : "has"
    USERS ||--o{ POSTS : "creates"
    USERS ||--o{ REACTIONS : "performs"
    USERS ||--o{ USER_TITLES : "earns"
    ANIMAL_PROFILES ||--o{ POSTS : "defined by"
    POSTS ||--o{ REACTIONS : "receives"
    TITLES ||--o{ USER_TITLES : "belongs to"
    ANIMAL_TYPES ||--o{ ANIMAL_PROFILES : "categorized by"
    ANIMAL_TYPES ||--o1 PROMPT_TEMPLATES : "uses"

    USERS {
        uuid id PK
        string clerk_id "Unique ID from Clerk"
        string nickname "Max 6 chars (Hiragana/Katakana)"
        uuid current_animal_profile_id FK
        timestamp created_at
    }
    POSTS {
        uuid id PK
        uuid user_id FK
        text original_content "Hidden from others"
        text translated_content
        string space_type "forest / lake"
        timestamp created_at
    }
    REACTIONS {
        uuid id PK
        uuid post_id FK
        uuid user_id FK "User who reacted"
        string type "tail / groom / stretch"
    }
    TITLES {
        uuid id PK
        string name "e.g., 日向ぼっこの達人"
        string category "default / unlocked"
        string unlock_condition_type
        int threshold
    }
    USER_TITLES {
        uuid id PK
        uuid user_id FK
        uuid title_id FK
        timestamp earned_at
    }
    ANIMAL_TYPES {
        uuid id PK
        string name "e.g., Dog, Cat"
        string sub_type "e.g., Shiba, Persian"
        boolean is_premium "Default is false"
    }
    PROMPT_TEMPLATES {
        uuid id PK
        string animal_type_id FK
        text system_prompt "Template for AI"
    }
```

## 2. テーブル定義詳細

### users (ユーザー)
| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| id | uuid | PK, default gen_random_uuid() | 内部ID |
| clerk_id | string | unique, not null | ClerkのユーザーID |
| nickname | varchar(6) | not null | ニックネーム（ひらがな・カタカナ） |
| current_title_id | uuid | FK (titles.id) | 現在設定中の称号 |
| created_at | timestamp | default now() | 作成日時 |

### posts (投稿)
| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| id | uuid | PK | 投稿ID |
| user_id | uuid | FK (users.id) | 投稿者ID |
| original_content | text | not null | 原文（本人以外非表示） |
| translated_content| text | not null | 翻訳後の動物の言葉 |
| space_type | varchar | not null | 空間（forest / lake） |
| created_at | timestamp | default now() | 投稿日時 |

### reactions (しぐさリアクション)
| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| id | uuid | PK | ID |
| post_id | uuid | FK (posts.id) | 対象投稿 |
| user_id | uuid | FK (users.id) | リアクションした人 |
| type | varchar | not null | しっぽ(tail), 毛づくろい(groom), のび(stretch) |

※ `post_id`, `user_id`, `type` の組み合わせでユニーク制約（UPSERT対応）とし、数ではなく「存在するか」を重視する。

### prompt_templates (プロンプト管理)
| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| id | uuid | PK | ID |
| animal_type | varchar | unique | 動物種別名 |
| system_prompt | text | not null | その動物用のAI指示文 |

## 3. RLS（Row Level Security）方針
- `posts`:
    - `SELECT`: `translated_content` は全ユーザー。`original_content` は `user_id = auth.uid()` の場合のみ。
    - `INSERT`: `auth.uid()` と一致する `user_id` でのみ許可。
- `users`:
    - `SELECT`: 全ユーザー（ニックネームと称号表示のため）。
    - `UPDATE`: `id = auth.uid()` の本人のみ。

