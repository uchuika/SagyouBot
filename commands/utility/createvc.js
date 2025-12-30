const {
    SlashCommandBuilder,
    MessageFlags,
    ContainerBuilder,
    ButtonBuilder,
    TextDisplayBuilder,
    ActionRowBuilder,
    ButtonStyle,

} = require('discord.js');
var { pagingSessions } = require('../../global-store.js');

const MEMBERS_PER_PAGE = 25;
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5分

let members;

var pagingSessions = new Map();

//コンポーネント生成関数
function buildComponents(sessionId, page) {
    const memberList = pagingSessions.get(sessionId);
    if (!memberList) return [];

    const start = page * MEMBERS_PER_PAGE;
    const pageMembers = memberList.slice(start, start + MEMBERS_PER_PAGE);

    const rows = [];
    let row = new ActionRowBuilder();

    pageMembers.forEach((member, index) => {
        const button = new ButtonBuilder()
            .setCustomId(`member_${sessionId}_${page}_${member.id}`)
            .setLabel(member.user.username)
            .setStyle(ButtonStyle.Secondary);

        row.addComponents(button);

        if ((index + 1) % 5 === 0) {
            rows.push(row);
            row = new ActionRowBuilder();
        }
    });

    if (row.components.length > 0) rows.push(row);

    const prevButton = new ButtonBuilder()
        .setCustomId(`page_prev_${sessionId}_${page}`)
        .setLabel('◀')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0);

    const nextButton = new ButtonBuilder()
        .setCustomId(`page_next_${sessionId}_${page}`)
        .setLabel('▶')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(start + MEMBERS_PER_PAGE >= memberList.length);

    if (rows.length < 5) {
        rows.push(new ActionRowBuilder().addComponents(prevButton, nextButton));
    } else {
        rows[rows.length - 1].addComponents(prevButton, nextButton);
    }

    return rows;
}

function disableAllComponents(components) {
    return components.map(row =>
        new ActionRowBuilder().addComponents(
            row.components.map(component =>
                ButtonBuilder.from(component).setDisabled(true)
            )
        )
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createvc')
        .setDescription('ボイスチャンネルを作成'),
    async execute(interaction) {

        /*
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
            */

        console.log('=========検出されたユーザー========');

        //メンバーの取得は初回しか呼ばない
        //opcode 8 回避のため
        if (!members) {
            members = await interaction.guild.members.fetch();
        }

        const memberList = [...members.values()];

        const sessionId = interaction.id;
        pagingSessions.set(sessionId, memberList);

        /*
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
        }*/

        console.log('===================================');

        await interaction.reply({
            //content: `メンバー一覧(ページ 1 / ${Math.ceil(memberList.length / MEMBERS_PER_PAGE)})`,
            components: buildComponents(sessionId, 0),
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral]
        });
        console.log('createVCコマンドが実行');
    },
};