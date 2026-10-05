import { EmbedBuilder } from 'discord.js';
import { ApiError, type ScanRow, type Mover } from './flashProps';
import { SIGNUP_URL } from './config';

const FLASH_ORANGE = 0xf58426;
const FOOTER = { text: 'Powered by Flash Props API · free key at api.flashodds.live' };

function odds(n?: number): string {
	if (n == null || Number.isNaN(n)) return '—';
	return n > 0 ? `+${n}` : `${n}`;
}

function propLine(r: ScanRow): string {
	return `**${r.player}** · ${r.stat} **${r.line}**  (o ${odds(r.overOdds)} / u ${odds(r.underOdds)})`;
}

function base(title: string): EmbedBuilder {
	return new EmbedBuilder().setColor(FLASH_ORANGE).setTitle(title).setFooter(FOOTER).setTimestamp();
}

// Discord descriptions cap at 4096 chars; keep well under by limiting rows.
function joinRows(rows: string[], max = 20): string {
	return rows.slice(0, max).join('\n');
}

export function boardEmbed(sport: string, rows: ScanRow[], stat?: string): EmbedBuilder {
	const e = base(`${sport.toUpperCase()} board${stat ? ` · ${stat}` : ''}`);
	if (!rows.length) {
		return e.setDescription('No props posted right now. Coverage varies by sport and time of day — try again near game time, or check https://api.flashodds.live/status.');
	}
	const lines = rows.map((r) => `${propLine(r)}\n _${r.awayTeam} @ ${r.homeTeam}_`);
	return e.setDescription(joinRows(lines)).setFooter({ text: `${rows.length} props · ${FOOTER.text}` });
}

export function playerEmbed(query: string, rows: ScanRow[], sport: string): EmbedBuilder {
	const e = base(`Props for "${query}"`);
	if (!rows.length) {
		return e.setDescription(
			`No live props found for **${query}** in **${sport}**. They may not be posted right now, or try a different sport with \`sport:\`.`
		);
	}
	const lines = rows.map((r) => `${propLine(r)}\n _${r.sport.toUpperCase()} · ${r.awayTeam} @ ${r.homeTeam}_`);
	return e.setDescription(joinRows(lines));
}

export function moversEmbed(since: string, movers: Mover[]): EmbedBuilder {
	const e = base('Biggest line movers');
	if (!movers.length) {
		return e.setDescription('No line movement recorded in this window yet. The movement archive builds over time — check back later.');
	}
	const lines = movers.map((m) => {
		const dir = (m.movement ?? 0) > 0 ? '📈' : '📉';
		const sign = (m.movement ?? 0) > 0 ? '+' : '';
		return `${dir} **${m.player}** · ${m.stat}  ${m.openedLine} → **${m.currentLine}**  (${sign}${m.movement})  _${m.sport.toUpperCase()}_`;
	});
	return e.setDescription(joinRows(lines)).setFooter({ text: `since ${since.slice(0, 16).replace('T', ' ')}Z · ${FOOTER.text}` });
}

export function aboutEmbed(): EmbedBuilder {
	return base('Flash Props bot')
		.setDescription(
			[
				'Live sports **player props** in Discord, from the Flash Props API.',
				'',
				'**Commands**',
				'`/board sport:` — the prop board for a sport',
				'`/props player:` — find a player’s props',
				'`/movers` — biggest line movers _(paid key)_',
				'',
				'A **free** key is for evaluation and sees every active sport, esports included. Paid plans raise the limits and add line movement and history.',
				'',
				`**Get your own free key** → ${SIGNUP_URL}`,
				'Then set `FLASH_PROPS_API_KEY` and run your own copy. Fork the starter: this bot is open source.'
			].join('\n')
		);
}

export function errorEmbed(err: unknown): EmbedBuilder {
	const e = new EmbedBuilder().setColor(0xef4444).setFooter(FOOTER);
	if (err instanceof ApiError) {
		if (err.status === 401 || err.code === 'no_key') {
			return e.setTitle('API key problem').setDescription(`${err.message}\n\nGet a free key at ${SIGNUP_URL}.`);
		}
		if (err.status === 403) {
			// Covers both sport gating ("nfl not in your Free tier, covers: basketball")
			// and Pro-only features ("line movement is a Pro feature"). The API's own
			// message is precise for each, so surface it rather than guessing.
			return e.setTitle('Not included in your tier').setDescription(`${err.message}\n\nSee tiers at ${SIGNUP_URL}/#pricing.`);
		}
		if (err.status === 429) {
			return e.setTitle('Rate limited').setDescription(`${err.message}\n\nYou hit your tier’s request limit. Upgrade or wait for the daily reset.`);
		}
		return e.setTitle('Request failed').setDescription(err.message);
	}
	return e.setTitle('Something went wrong').setDescription('Unexpected error. Check the bot logs.');
}
