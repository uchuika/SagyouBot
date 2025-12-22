const {
    SlashCommandBuilder,
    MessageFlags,
    ContainerBuilder,
    ButtonBuilder,
    TextDisplayBuilder,
    ActionRowBuilder,
    ButtonStyle,
    discord
} = require('discord.js');

let components = new ContainerBuilder()
    .addTextDisplayComponents(
        new TextDisplayBuilder({
            content: "## どのボタンが好き？",
        })
    )
    .addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('button2')
                .setLabel('緑！')
                .setStyle(ButtonStyle.Success)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('button3')
                .setLabel('赤！')
                .setStyle(ButtonStyle.Danger)
        )
    );

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createvc')
        .setDescription('ボイスチャンネルを作成'),
    async execute(interaction) {
        await interaction.reply({
            components: [components],
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral]
        });
        console.log('createVCコマンドが実行');
    },
};