const {
    SlashCommandBuilder,
    MessageFlags,
    ContainerBuilder,
    ButtonBuilder,
    TextDisplayBuilder,
    ActionRowBuilder,
    ButtonStyle,
    Client,
    GatewayIntentBits
} = require('discord.js');

let buttons = [];



let components = new ContainerBuilder()
    .addTextDisplayComponents(
        new TextDisplayBuilder({
            content: "## VCに接続を許可する人を選択してください",
        })
    )
    .addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('button2')
                .setLabel('テスト用VC')
                .setStyle(ButtonStyle.Success)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('button3')
                .setLabel('赤！')
                .setStyle(ButtonStyle.Danger)
        )
    );

//const members = client.guild.members.fetch();

/*
for (const member of members.values()) {
    components.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(member.user.id)
                .setLabel(member.user.displayName)
                .setStyle(ButtonStyle.Success)
                .setDisabled(true)
        )
    );
}*/



module.exports = {
    data: new SlashCommandBuilder()
        .setName('createvc')
        .setDescription('ボイスチャンネルを作成'),
    async execute(interaction) {

        //コンポーネントの生成
        let components = new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder({
                    content: "## VCに接続を許可する人を選択してください",
                })
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('button2')
                        .setLabel('テスト用VC')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('button3')
                        .setLabel('赤！')
                        .setStyle(ButtonStyle.Danger)
                )
            );

        const members = await interaction.guild.members.fetch();

        console.log('=========検出されたユーザー========');

        for (const member of members.values()) {
            console.log(`${member.user.displayName}(${interaction.user.id})`);
            components.addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(member.user.id)
                        .setLabel(member.user.displayName)
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true)
                )
            );
        }

        console.log('===================================');

        await interaction.reply({
            components: [components],
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral]
        });
        console.log('createVCコマンドが実行');
    },
};