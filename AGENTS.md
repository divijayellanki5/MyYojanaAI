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

# Project rules

- Scheme catalogue and eligibility rules live in code (`src/lib/schemes.ts`), not the database — rules are functions, so loaders must return only serializable fields (look schemes up by id in components).
- User data (profiles, saved schemes) is read/written from the browser client under owner-only RLS; signed-in pages live under `src/routes/_authenticated/`.
