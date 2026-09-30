# RatingStars

Shows an average rating from the API, or lets a shopper pick 1–5 stars.

```tsx
{p.rating_count > 0 && <RatingStars value={p.rating_avg} count={p.rating_count} />}
<RatingStars value={stars} onChange={setStars} />
```

Display mode is only for numbers the API returned (CLAUDE.md rule 5): render nothing when `rating_count` is 0.
The picker is a `radiogroup`; arrow keys move the choice, Tab reaches the chosen star.
