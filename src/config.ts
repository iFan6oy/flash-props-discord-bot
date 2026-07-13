import 'dotenv/config';

function required(name: string): string {
	const v = process.env[name]?.trim();
	if (!v) {
		console.error(`\n✖ Missing required env var: ${name}`);
		console.error('  Copy .env.example to .env and fill it in, then try again.\n');
		process.exit(1);
	}
	return v;
}

export const SIGNUP_URL = 'https://api.flashodds.live';

export const config = {
	token: required('DISCORD_TOKEN'),
	clientId: required('DISCORD_CLIENT_ID'),
	devGuildId: process.env.DEV_GUILD_ID?.trim() || '',
	apiKey: process.env.FLASH_PROPS_API_KEY?.trim() || '',
	baseUrl: (process.env.FLASH_PROPS_BASE_URL?.trim() || SIGNUP_URL).replace(/\/$/, ''),
	daily: {
		channelId: process.env.DAILY_CHANNEL_ID?.trim() || '',
		sport: process.env.DAILY_SPORT?.trim() || 'mlb',
		cron: process.env.DAILY_CRON?.trim() || '0 17 * * *'
	}
};

if (!config.apiKey) {
	console.warn(`⚠ FLASH_PROPS_API_KEY is not set — commands will prompt for a free key (${SIGNUP_URL}).`);
}
