# API 仕様書

## 1. 設計原則
- **プロトコル**: RESTful API / JSON
- **認証**: Clerk JWT による認証。全てのプライベートエンドポイントでヘッダーに `Authorization: Bearer <token>` を要求する。
- **データ操作**: 更新系操作は Next.js Server Actions を優先するが、外部連携や複雑な非同期処理用にAPIエンドポイントも定義する。

## 2. エンドポイント一覧

### 2.1 投稿関連

#### `POST /api/posts/translate`
ユーザーの入力を動物の言葉に翻訳します。
- **リクエスト**:
  ```json
  {
    "content": "今日は会議が多くて疲れました",
    "animal_type": "shiba"
  }
  ```
- **レスポンス**:
  ```json
  {
    "translated_content": "今日は群れの集まりが長かった。日陰で少し休みたくなった。",
    "status": "success"
  }
  ```

#### `POST /api/posts`
翻訳済みの投稿を保存します。
- **リクエスト**:
  ```json
  {
    "original_content": "今日は会議が多くて疲れました",
    "translated_content": "今日は群れの集まりが長かった...",
    "space_type": "forest"
  }
  ```
- **レスポンス**: 201 Created

### 2.2 リアクション関連

#### `POST /api/reactions`
投稿に対して「しぐさ」を送ります（または解除します）。
- **リクエスト**:
  ```json
  {
    "post_id": "uuid-xxx",
    "type": "tail"
  }
  ```
- **レスポンス**: 200 OK (点灯状態を返す)

### 2.3 称号・プロフィール関連

#### `GET /api/users/me/titles`
ユーザーが獲得済みの称号一覧を取得します。
- **レスポンス**:
  ```json
  [
    {"id": "uuid-1", "name": "はじめての足跡", "is_unlocked": true},
    {"id": "uuid-2", "name": "窓辺の警備隊長", "is_unlocked": true},
    {"id": "uuid-3", "name": "森の番人", "is_unlocked": false}
  ]
  ```

### 2.4 管理者用（プロンプト管理）

#### `GET /api/admin/prompts`
全ての動物人格のプロンプト一覧を取得します。

#### `PATCH /api/admin/prompts/:id`
特定の動物人格のプロンプトテンプレートを更新します。
- **リクエスト**:
  ```json
  {
    "system_prompt": "あなたは思慮深い老犬です。語尾は『〜じゃな』としてください。..."
  }
  ```

## 3. エラーレスポンス
標準的なHTTPステータスコードを使用します。
- `401 Unauthorized`: 認証トークンが無効または欠落。
- `403 Forbidden`: 権限のない操作（他人の原文を見ようとした等）。
- `422 Unprocessable Entity`: AIによる検閲で投稿が拒否された場合。
- `429 Too Many Requests`: 投稿頻度制限。

