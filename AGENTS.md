<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Rating data lives in static `src/data/gomel-2026.json` (table stages copied as is, protocol stages stored as raw times) and is computed in `src/lib/rating.ts`; new stages are added by appending to `stages` and `protocols` — no backend needed for a static, manually updated rating.
