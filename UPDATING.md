# Updating the Walby Pool site during the tournament

Created by Brian Walby. Site: https://bwalby97.github.io/Walby-Pool-Probability-of-Finish-Walby-Creation/

## Files
- `index.html`, `engine.js`: the page and the calculator. Do not change during a game-day update.
- `data.js`: teams, seeds, regions, Vegas odds (with cited source) and every entry's picks, per pool. Built once when brackets lock.
- `results.json`: official results only. This is the only file a game-day update changes. Open pages re-read it every 10 minutes.
- `config.json`: ESPN challenge and group ids, fee and payout for each pool. `season` must match the year being played.

## results.json format
`{"asOf":"<unique string, e.g. ISO time>","label":"Official results through game N of 63, updated <time> ET","note":"","pools":{"main":{"0":"Arizona",...},"champs":{...},"women":{...}}}`
Game ids: 0-31 Round of 64, 32-47 Round of 32, 48-55 Sweet 16, 56-59 Elite 8, 60-61 Final Four, 62 title. Regions are 0-3; slot order in each region is seeds 1,16,8,9,5,12,4,13,6,11,3,14,7,10,2,15. Winner names must match the names in `data.js` for that pool (for example "UConn", "St John's", "Michigan St").
`asOf` must change on every update or open pages ignore it. Never write a winner for a game that is not final. Men's pools share the same results. The Women's Pool has its own.

## Game-day schedule (2027)
Selection Sunday Mar 14. Opening Round (12 games) Mar 16-17. Round of 64 Mar 18-19. Round of 32 Mar 20-21. Sweet 16 Mar 25-26. Elite 8 Mar 27-28. Final Four Apr 3. Title game Apr 5. The 2027 field is 76 teams, so check how ESPN handles the Opening Round winners in the 63-game bracket before the first update.
Run hourly on days with games, starting 2 hours after the day's first tip-off, and once at 2 a.m. ET the day after a game day to catch late finishes. Skip days with no games.

## ESPN
Group entries and picks: `https://gambit-api.fantasy.espn.com/apis/v1/challenges/<challengeId>/groups/<groupId>?platform=chui&view=chui_default_group` (works from a fantasy.espn.com page in the browser; the sandbox cannot reach ESPN directly). Men's challenge id 277 and women's 278 in 2026. Outcome ids differ per game, so match picks and results by team name.

## Publishing
Update `results.json` on the `main` branch of bwalby97/Walby-Pool-Probability-of-Finish-Walby-Creation. GitHub Pages rebuilds in about 30 seconds; browsers can cache a page for up to 10 minutes.
After publishing, confirm the new `asOf` is served at /results.json.
