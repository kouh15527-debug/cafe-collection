# Cafe Collection — STEP 1–15

HTML / CSS / JavaScript の学習用完成版です。

## ファイル
- `index.html` — ページ構造（Hero、追加フォーム、検索、一覧）
- `style.css` — レスポンシブデザイン、カード、Hero、アニメーション
- `script.js` — 追加・編集・削除・お気に入り・検索・保存・ID管理
- `images/` — 動作確認用のサンプル画像（好きな写真に差し替え可能）

## ローカルで開く
1. ZIPを展開し、VS Codeでこのフォルダを開く。
2. Live Server拡張機能で `index.html` を開く（または直接ブラウザで開く）。
3. カフェを追加、検索、編集、お気に入り登録、削除して動作確認する。
4. 保存先はブラウザの `localStorage`。他の端末との同期はありません。

## STEP 15 — GitHub Pages で公開する
1. GitHubにログインして新しい**Public**リポジトリ（例: `cafe-collection`）を作成。
2. このフォルダ内の `index.html`、`style.css`、`script.js`、`images` フォルダをリポジトリのルートへアップロードしてコミット。
3. リポジトリの **Settings → Pages → Build and deployment** で **Deploy from a branch** を選択。
4. Branch を `main`、フォルダを `/ (root)` に設定して **Save**。
5. デプロイが完了したら Pages に表示された公開URLへアクセス。

※ 公開URLは通常 `https://<GitHubユーザー名>.github.io/cafe-collection/` 形式ですが、実際のURLはGitHub Pages画面で確認してください。
※ データは端末・ブラウザごとに保存され、公開したサイトに共有データベースはありません。
※ このZIPは完成コードと公開手順です。GitHubへのアップロード・公開はまだ行っていません。
