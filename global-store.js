const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

//グローバル変数
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