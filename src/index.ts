import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from './config';
import { handleCommand } from './commands';
import { startDailyPost } from './daily';

// Slash commands only need the Guilds intent — no message-content privilege.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
	console.log(`✅ Flash Props bot online as ${c.user.tag}`);
	console.log('   Try /board sport:mlb  ·  /props player:  ·  /movers');
	startDailyPost(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	try {
		await handleCommand(interaction);
	} catch (err) {
		console.error('Command handler error:', err);
	}
});

client.login(config.token);
