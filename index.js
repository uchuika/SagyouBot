const fs = require('node:fs');
const path = require('node:path');
const { MessageFlags, Client, Collection, Events, GatewayIntentBits, ChannelType } = require('discord.js');
const { token } = require('./config.json');
const buttonHandler = require('./button.js');
const button = require('./button.js');

const { activePrivateVCs } = buttonHandler;

const VC_DELETE_COOLDOWN = 60 * 1000; // 60秒

const client = new Client({ intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b) });

client.commands = new Collection();

client.on('ready', () => {
	console.log(`${client.user.tag}でログインしました。`);

});

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}


//コマンドに関する処理
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`${interaction.commandName} に一致するコマンドが見つかりませんでした。`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'このコマンドの実行中にエラーが発生しました！', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'このコマンドの実行中にエラーが発生しました！', flags: MessageFlags.Ephemeral });
		}
	}
});

//ボタンについての処理
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton()) return;

	await buttonHandler.execute(interaction);

	if (interaction.customId == 'button2') {
		await interaction.reply({
			content: 'VCを作成します',
			flags: MessageFlags.Ephemeral
		});
		console.log(`VCを作成します ${interaction.user.displayName}(${interaction.user}) `);

		//VCを作成
		await interaction.guild.channels.create({
			name: '作業test',
			type: ChannelType.GuildVoice,
			parent: '1451214635700064359'
		});
	}

	if (interaction.customId == 'button3') {
		await interaction.reply({
			content: 'ボタン3が押されました',
			flags: MessageFlags.Ephemeral
		});
		console.log(`ボタン3が押されました ${interaction.user.displayName}(${interaction.user}) `);
	}
});

//VC自動削除用
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
	// VC 退出時のみチェック
	if (oldState.channelId && oldState.channelId !== newState.channelId) {
		const channelId = oldState.channelId;

		if (!activePrivateVCs.has(channelId)) return;

		const channel = oldState.guild.channels.cache.get(channelId);
		if (!channel) {
			activePrivateVCs.delete(channelId);
			return;
		}

		// まだ人がいる
		if (channel.members.size > 0) return;

		/*
		const createdAt = activePrivateVCs.get(channelId);
		const elapsed = Date.now() - createdAt;

		// クールダウン未経過
		if (elapsed < VC_DELETE_COOLDOWN) return;
		*/

		try {
			await channel.delete('Private VC auto cleanup');
		} catch { }

		activePrivateVCs.delete(channelId);
	}
});

client.login(token);

module.exports = {
	client,
};