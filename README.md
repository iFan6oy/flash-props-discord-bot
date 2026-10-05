# Flash Props Discord Bot

A tiny, open-source Discord bot that posts live sports **player props** straight into your server, powered by the [Flash Props API](https://api.flashodds.live). Fork it, drop in two keys, and you have a working props bot in about 5 minutes.

Covers the props board across MLB, NFL, NBA, NHL, NCAA, soccer, tennis, and esports (CS2, Valorant, Dota 2, Call of Duty).

```
/board sport:mlb          ->  today's MLB prop board
/props player:judge       ->  Aaron Judge's props
/movers sport:nfl since:24h  ->  biggest line moves (Pro key)
```

## What you get

| Command | What it does |
|---|---|
| `/board sport:` | The player-prop board for a sport, with optional `stat:` filter |
| `/props player:` | Find one player's props (optionally scoped to a `sport:`) |
| `/movers` | The biggest line movers in a window (needs a paid API key) |
| `/flashprops` | About + where to get a free key |
| Daily auto-post | Optional scheduled board post to a channel (off by default) |

Every reply carries a `Powered by Flash Props API` footer, so anyone who sees it in your server can grab their own free key.

## 5-minute setup

### 1. Get the code

```bash
git clone https://github.com/iFan6oy/flash-props-discord-bot.git
cd flash-props-discord-bot
npm install
```

### 2. Create a Discord bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. Open the **Bot** tab, click **Reset Token**, and copy the token.
3. Open **General Information** and copy the **Application ID**.
4. Invite the bot to your server: **OAuth2 -> URL Generator**, check `bot` and `applications.commands`, open the generated URL, and add it to a server you manage.

### 3. Get a free Flash Props key

Grab one in about 30 seconds at **https://api.flashodds.live**. No card required. Free is for evaluation (300 requests/day, 10/min, 15 rows per scan) and sees every active sport, esports included. Builder ($19/mo) is where recurring production use starts, and line movement and history need a paid key (limited on Builder, full on Pro). Coverage changes through the season, so check `GET /api/v1/sports` for what is live, and see the current plans at https://api.flashodds.live/api/v1/pricing.

### 4. Configure

```bash
cp .env.example .env
```

Fill in `.env`:

```ini
DISCORD_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-application-id
FLASH_PROPS_API_KEY=flash_live_your_key
# Optional, for instant command updates while testing:
DEV_GUILD_ID=your-test-server-id
```

### 5. Register commands and start

```bash
npm run register   # tells Discord about the slash commands
npm start          # boots the bot
```

You should see `Flash Props bot online as ...`. In Discord, type `/board` and go.

> Global commands can take up to an hour to appear the first time. Set `DEV_GUILD_ID` to register them to your test server instantly.

## Optional: daily board post

Set these in `.env` and the bot will post a board to a channel on a schedule:

```ini
DAILY_CHANNEL_ID=123456789012345678
DAILY_SPORT=mlb
DAILY_CRON=0 17 * * *   # 5:00 PM in the host's timezone
```

Leave `DAILY_CHANNEL_ID` blank to keep it off.

## Deploy it somewhere

It is a plain Node.js process (`npm start`), so anything that runs Node works:

- **Railway / Render / Fly.io**: point at the repo, set the env vars, run `npm run register` once, start `npm start`.
- **A VPS with pm2**: `pm2 start "npm start" --name flash-props-bot`.

## Configuration reference

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DISCORD_TOKEN` | yes | | Bot token |
| `DISCORD_CLIENT_ID` | yes | | Application ID |
| `FLASH_PROPS_API_KEY` | yes | | Free at api.flashodds.live |
| `FLASH_PROPS_BASE_URL` | no | `https://api.flashodds.live` | Override for self-hosting |
| `DEV_GUILD_ID` | no | | Register commands to one server instantly |
| `DAILY_CHANNEL_ID` | no | | Enables the daily post when set |
| `DAILY_SPORT` | no | `mlb` | Sport for the daily post |
| `DAILY_CRON` | no | `0 17 * * *` | Cron in the host timezone |

## How it works

- `src/flashProps.ts` is a thin typed client over the REST API (`/api/v1/props`, `/api/v1/props/movement`). It uses the built-in `fetch`, so there are no HTTP dependencies.
- `src/commands.ts` defines the slash commands and handles them.
- `src/embeds.ts` builds the Discord embeds.
- `src/daily.ts` runs the optional scheduled post.

Want a command the starter does not have? The API also serves `/api/v1/props/history`, `/api/v1/sports`, and an MCP server. See the docs at https://api.flashodds.live/docs.

## Notes

Data is for informational use only. This bot does not accept wagers and is not affiliated with any league, team, sportsbook, or DFS operator. 21+.

Built with [discord.js](https://discord.js.org). Licensed MIT, so fork away.
