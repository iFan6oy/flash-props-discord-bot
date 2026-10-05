import { SlashCommandBuilder, MessageFlags, type ChatInputCommandInteraction } from 'discord.js';
import * as fp from './flashProps';
import * as E from './embeds';

// Slash command definitions, serialized for registration with Discord.
export const commandData = [
	new SlashCommandBuilder()
		.setName('board')
		.setDescription("Today's player-prop board for a sport")
		.addStringOption((o) =>
			o
				.setName('sport')
				.setDescription('nba, mlb, nfl, nhl, soccer, tennis, cs2, valorant, dota2, esports')
				.setRequired(true)
		)
		.addStringOption((o) => o.setName('stat').setDescription('Filter to one stat, e.g. points, strikeouts, kills_on_maps_1_2'))
		.addIntegerOption((o) => o.setName('limit').setDescription('How many props to show (1-20)').setMinValue(1).setMaxValue(20)),
	new SlashCommandBuilder()
		.setName('props')
		.setDescription("Find a player's props")
		.addStringOption((o) => o.setName('player').setDescription('Player name (partial is fine)').setRequired(true))
		.addStringOption((o) => o.setName('sport').setDescription('Sport to search (defaults to the in-season sport)')),
	new SlashCommandBuilder()
		.setName('movers')
		.setDescription('Biggest line movers (requires a paid API key)')
		.addStringOption((o) => o.setName('sport').setDescription('Limit to one sport'))
		.addStringOption((o) => o.setName('since').setDescription('Lookback window: 6h, 24h, 3d')),
	new SlashCommandBuilder().setName('flashprops').setDescription('About this bot and how to get a free API key')
].map((c) => c.toJSON());

export async function handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
	if (interaction.commandName === 'flashprops') {
		await interaction.reply({ embeds: [E.aboutEmbed()], flags: MessageFlags.Ephemeral });
		return;
	}

	// API calls can take a moment; acknowledge within Discord's 3s window.
	await interaction.deferReply();
	try {
		switch (interaction.commandName) {
			case 'board': {
				const sport = interaction.options.getString('sport', true);
				const stat = interaction.options.getString('stat') ?? undefined;
				const limit = interaction.options.getInteger('limit') ?? 15;
				const data = await fp.scanBoard({ sport, stat, limit });
				await interaction.editReply({ embeds: [E.boardEmbed(data.sport, data.rows, stat)] });
				break;
			}
			case 'props': {
				const player = interaction.options.getString('player', true);
				const sport = interaction.options.getString('sport') ?? undefined;
				// The API scans a whole sport; filter to the requested player client-side.
				const data = await fp.scanBoard({ sport, limit: 200 });
				const q = player.toLowerCase();
				const rows = data.rows.filter((r) => r.player.toLowerCase().includes(q));
				await interaction.editReply({ embeds: [E.playerEmbed(player, rows, data.sport)] });
				break;
			}
			case 'movers': {
				const sport = interaction.options.getString('sport') ?? undefined;
				const since = interaction.options.getString('since') ?? '24h';
				const data = await fp.movers({ sport, since, limit: 12 });
				await interaction.editReply({ embeds: [E.moversEmbed(data.since, data.movers)] });
				break;
			}
			default:
				await interaction.editReply('Unknown command.');
		}
	} catch (err) {
		await interaction.editReply({ embeds: [E.errorEmbed(err)] });
	}
}
