// Registers the slash commands with Discord. Run once (and after changing any
// command definition): `npm run register`.
//
// - With DEV_GUILD_ID set, commands register to that server INSTANTLY (best for
//   development).
// - Without it, they register globally and can take up to ~1 hour to appear.
import { REST, Routes } from 'discord.js';
import { config } from './config';
import { commandData } from './commands';

const rest = new REST({ version: '10' }).setToken(config.token);

const route = config.devGuildId
	? Routes.applicationGuildCommands(config.clientId, config.devGuildId)
	: Routes.applicationCommands(config.clientId);

try {
	console.log(`Registering ${commandData.length} commands ${config.devGuildId ? `to guild ${config.devGuildId}` : 'globally'}...`);
	await rest.put(route, { body: commandData });
	console.log('✅ Commands registered.');
	if (!config.devGuildId) console.log('   Global commands can take up to ~1h to show. Set DEV_GUILD_ID for instant updates while testing.');
} catch (err) {
	console.error('✖ Failed to register commands:', err);
	process.exit(1);
}
