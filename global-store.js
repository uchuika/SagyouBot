const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

const vcSessions = new Map();

const MEMBERS_PER_PAGE = 20;
const SESSION_TIMEOUT = 5 * 60 * 1000;

/**
 * UI 構築
 */
function buildComponents(sessionId, page) {
    const session = vcSessions.get(sessionId);
    if (!session) return [];

    const { members, selected } = session;
    const start = page * MEMBERS_PER_PAGE;
    const pageMembers = members.slice(start, start + MEMBERS_PER_PAGE);

    const rows = [];
    let row = new ActionRowBuilder();

    pageMembers.forEach((member, index) => {
        const button = new ButtonBuilder()
            .setCustomId(`member_${sessionId}_${page}_${member.id}`)
            .setLabel(member.user.displayName)
            .setStyle(
                selected.has(member.id)
                    ? ButtonStyle.Success
                    : ButtonStyle.Secondary
            );

        row.addComponents(button);

        if ((index + 1) % 5 === 0) {
            rows.push(row);
            row = new ActionRowBuilder();
        }
    });

    if (row.components.length > 0) rows.push(row);

    const totalPages = Math.ceil(members.length / MEMBERS_PER_PAGE);

    const prevButton = new ButtonBuilder()
        .setCustomId(`page_prev_${sessionId}_${page}`)
        .setLabel('◀')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 0);

    const pageInfo = new ButtonBuilder()
        .setCustomId('page_info')
        .setLabel(`${page + 1} / ${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const nextButton = new ButtonBuilder()
        .setCustomId(`page_next_${sessionId}_${page}`)
        .setLabel('▶')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(start + MEMBERS_PER_PAGE >= members.length);

    const confirmButton = new ButtonBuilder()
        .setCustomId(`confirm_${sessionId}`)
        .setLabel('決定')
        .setStyle(ButtonStyle.Success)
        .setDisabled(selected.size === 0);

    rows.push(
        new ActionRowBuilder().addComponents(
            prevButton,
            pageInfo,
            nextButton,
            confirmButton
        )
    );

    return rows;
}

function disableComponents(components) {
    return components.map(row =>
        new ActionRowBuilder().addComponents(
            row.components.map(c =>
                ButtonBuilder.from(c).setDisabled(true)
            )
        )
    );
}

module.exports = {
    vcSessions,
    MEMBERS_PER_PAGE,
    SESSION_TIMEOUT,
    buildComponents,
    disableComponents,
};