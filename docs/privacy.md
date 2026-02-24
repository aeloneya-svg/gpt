# Privacy, Safety, and Compliance

## Data collected
- Account identifiers and progression fields.
- Match state/results for authoritative integrity and post-match history.
- Creator build metadata and publication records.
- Optional analytics events for product metrics (opt-in only).
- Moderation reports and anti-cheat flags for trust-and-safety enforcement.

## Minor protections (13+)
- `isMinor` flag defaults parental controls on.
- Spend cap and daily play limit fields are embedded in player settings and enforceable via settings endpoints.
- Session reminder minutes are stored for non-exploitative engagement nudges.
- No pay-to-win progression paths are present in backend endpoints.
- Transparent store pricing with direct purchases and explicit odds disclosures.

## UGC and moderation
- Users can submit reports against builds/players using `/reports`.
- Moderation queue visible at `/admin/reports`.
- Anti-cheat signal queue visible at `/admin/anti-cheat/flags`.

## Transparency
- Reward systems and modifiers are explicit and server-configured.
- No hidden probabilistic lootbox mechanics are implemented in this slice.
