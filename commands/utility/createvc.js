const {
    SlashCommandBuilder,
    MessageFlags,
} = require('discord.js');

const {
    vcSessions,
    MEMBERS_PER_PAGE,
    SESSION_TIMEOUT,
    buildComponents,
    disableAllComponents,
} = require('../../global-store.js');

let members;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createvc')
        .setDescription('ボイスチャンネルを作成'),
    async execute(interaction) {

        //メンバーの取得は初回しか呼ばない
        //opcode 8 回避のため
        if (!members) {
            members = await interaction.guild.members.fetch();
        }

        const memberList = [...members.values()].filter(m => !m.user.bot);

        const sessionId = interaction.id;
        vcSessions.set(sessionId, {
            members: memberList,
            selected: new Set([interaction.user.id]),
        });

        const replay = await interaction.reply({
            //content: `メンバー一覧（ページ 1 / ${Math.ceil(memberList.length / MEMBERS_PER_PAGE)}）`,
            components: buildComponents(sessionId, 0),
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            withResponse: true
        });

        // セッション自動破棄 + UI 無効化
        setTimeout(async () => {
            if (!vcSessions.has(sessionId)) return;

            vcSessions.delete(sessionId);

            try {
                await replay.edit({
                    content: '⏰ このメニューは期限切れです。',
                    components: disableAllComponents(replay.components),
                });
                console.log(`セッション: ${sessionId}はタイムアウトしました`);
            } catch {
                // メッセージ削除済みなど
            }
        }, SESSION_TIMEOUT);

        await interaction.followUp({
            content: `参加させたいユーザーを選択してください`,
            flags: [MessageFlags.Ephemeral]
        });
        console.log(`${interaction.user.displayName}により createVCコマンドが実行`);

    },
};