const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!と返信。'),
	async execute(interaction) {
		await interaction.reply({
			content: 'Pong',
			flags: MessageFlags.Ephemeral
		});
	},
};