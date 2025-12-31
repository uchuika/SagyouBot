const {
    vcSessions,
    MEMBERS_PER_PAGE,
    buildComponents,
} = require('./global-store.js');

const {
    ChannelType,
    PermissionFlagsBits,
    MessageFlags,
} = require('discord.js');

const { client } = require('./index.js');

const activePrivateVCs = new Map();

module.exports = {

    activePrivateVCs,

    async execute(interaction) {
        if (!interaction.isButton()) return;

        const parts = interaction.customId.split('_');

        /** ページング */
        if (parts[0] === 'page') {
            const [, dir, sessionId, pageStr] = parts;
            const page = Number(pageStr) + (dir === 'next' ? 1 : -1);

            const session = vcSessions.get(sessionId);
            if (!session) {
                await interaction.followUp({
                    content: 'この操作は無効です',
                    flags: [MessageFlags.Ephemeral],
                });
                return;
            }

            await interaction.update({
                components: buildComponents(sessionId, page),
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            });
            return;
        }

        /** ユーザー選択 */
        if (parts[0] === 'member') {
            const [, sessionId, pageStr, userId] = parts;
            const session = vcSessions.get(sessionId);
            if (!session) return;

            if (session.selected.has(userId)) {
                session.selected.delete(userId);
            } else {
                session.selected.add(userId);
            }

            await interaction.update({
                components: buildComponents(sessionId, Number(pageStr)),
                flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
            });
            return;
        }

        /** 決定 */
        if (parts[0] === 'confirm') {
            const sessionId = parts[1];
            const session = vcSessions.get(sessionId);
            if (!session) return;

            const selectedIds = [...session.selected];

            const channel = await interaction.guild.channels.create({
                name: `${interaction.user.displayName}の作業チャンネル`,
                type: ChannelType.GuildVoice,
                parent: '1451214635700064359',
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    //チャンネル作成者は選択しなくても権限を持っている
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.Speak,
                        ],
                    },
                    ...selectedIds.map(id => ({
                        id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.Speak,
                        ],
                    })),
                ],
            });

            console.log('VC作成が決定されました メンバーは');
            for (var Ids of selectedIds) {
                console.log(Ids);
            }


            // 作成時刻を保存
            activePrivateVCs.set(channel.id, Date.now());

            vcSessions.delete(sessionId);


            await interaction.reply({
                content: `VC を作成しました: ${channel}`,
                flags: [MessageFlags.Ephemeral],
            });
        }
    },
};