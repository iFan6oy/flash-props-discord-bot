import cron from 'node-cron';
import { type Client } from 'discord.js';
import { config } from './config';
import * as fp from './flashProps';
import * as E from './embeds';

// Optional: post a daily board to a channel. Disabled unless DAILY_CHANNEL_ID is set.
export function startDailyPost(client: Client): void {
	const { channelId, sport, cron: expr } = config.daily;
	if (!channelId) return;
	if (!cron.validate(expr)) {
		console.warn(`⚠ Invalid DAILY_CRON "${expr}" — daily post disabled.`);
		return;
	}
	cron.schedule(expr, async () => {
		try {
			const channel = await client.channels.fetch(channelId);
			if (!channel?.isTextBased() || !('send' in channel)) return;
			const data = await fp.scanBoard({ sport, limit: 15 });
			await channel.send({ embeds: [E.boardEmbed(data.sport, data.rows)] });
			console.log(`Posted daily ${sport} board to ${channelId}.`);
		} catch (err) {
			console.error('Daily post failed:', err);
		}
	});
	console.log(`🗓  Daily ${sport} board scheduled ("${expr}") to channel ${channelId}.`);
}
