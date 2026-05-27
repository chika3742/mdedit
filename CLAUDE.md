## 概要

CodeMirror 6 ベースの組み込み向け Markdown エディタライブラリ。`createMarkdownEditor` がエントリポイント（`src/index.ts`）。

## コマンド

- `pnpm dev` — example をローカルサーバーで起動
- `pnpm test` — vitest でテスト実行
- `pnpm typecheck` — 型チェック
- `pnpm lint` — ESLint
- `pnpm check` — lint, typecheck, testの順にすべて実行

## 注意事項

- ESLintのルールに従うこと
- 既存のパターンを確実に踏襲すること
- 個別の許可が必要になるような複雑なコマンドは極力使用しない
- コメントはすべて英語で記入すること
- 変数名は意図が正確に伝わるように、省略せず命名する
- 仕様の変更が発生した場合は、まずはテストを更新し、実装を修正する
- コードに手を加えるときはテストも必ず修正する
