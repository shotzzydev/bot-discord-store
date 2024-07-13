import { Command } from "#base";
import { db } from "#database";
import { settings } from "#settings";
import { createEmbed, createRow } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder, ChannelType, StringSelectMenuBuilder } from "discord.js";

new Command({
    name: "definir",
    description: "Todos os commandos com as incial de definir",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "ticket",
            description: "Sistema de atendimento via ticket",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "canal",
                    description: "Selecione o canal onde será enviada a messagem",
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText],
                    required,
                },
                {
                    name: "cargo-atendimento",
                    description: "Selecione o cargo que vai te acesso ao tickets criados",
                    type: ApplicationCommandOptionType.Role,
                    required,
                },
                {
                    name: "categoria-compras",
                    description: "Selecione a categoria onde será criadas aos ticket de comprar",
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildCategory],
                    required,
                },
                {
                    name: "categoria-suporte",
                    description: "Selecione a categoria que vai te acesso aos ticket de suporte",
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildCategory],
                    required,
                },
                {
                    name: "categoria-parceria",
                    description: "Selecione a categoria que vai te acesso aos ticket de suporte",
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildCategory],
                    required,
                },
                {
                    name: "transcript",
                    description: "Selecione o canal onde será enviado a logs dos ticket finalizados",
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText],
                    required,
                },
                {
                    name: "imagem",
                    description: "Selecione uma imagem",
                    type: ApplicationCommandOptionType.Attachment,
                    required,
                }
            ]
        }
    ],
    async run(interaction) {
        const { options, guild, user } = interaction;
        const channel = options.getChannel("canal", true, [ChannelType.GuildText]);
        const role = options.getRole("cargo-atendimento", true);
        const buy = options.getChannel("categoria-compras", true, [ChannelType.GuildCategory]);
        const support = options.getChannel("categoria-suporte", true, [ChannelType.GuildCategory]);
        const partnering = options.getChannel("categoria-parceria", true, [ChannelType.GuildCategory]);
        const transcript = options.getChannel("transcript", true, [ChannelType.GuildText]);
        const image = options.getAttachment("imagem", true);
        
        db.guilds.upset(db.guilds.id(guild.id), {
            ticket: {
                role_support: role.id,
                category_buy: buy.id,
                category_support: support.id,
                category_partnering: partnering.id,
                channel_transcripts: transcript.id
            }
        });

        const embed = createEmbed({
            author: {
                name: `📩 Ticket - ${guild.name}`,
                iconURL: guild.iconURL() || undefined
            },
            thumbnail: guild.iconURL(),
            description: "Se você desejá receber **`suporte`** ou realizar alguma **`Comprar`** abra um ticket.\n\n> Comprar\n> Suporte\n> Parceria",
            color: settings.colors.default
        });

        const row = createRow(
            new StringSelectMenuBuilder({
                customId: "ticket/create/channel",
                placeholder: "Selecione uma opção...",
                options: [
                    { emoji: "🛒", label: "Comprar", description: "Deseja comprar algum produto?", value: "category_buy" },
                    { emoji: "☎️", label: "Suporte", value: "category_support", description: "Precisando de ajuda ou está com dúvidas?" },
                    { emoji: "🤝", label: "Parceria", value: "category_partnering", description: "Quer se tornar nosso parceiro?" },
                ]
            })
        );

        const attachment = new AttachmentBuilder(image?.url, { name: "imagem.png" });

        if (image) {
            embed.setImage(`attachment://${attachment.name}`)
        }

        channel.send({ embeds: [embed], files: [attachment], components: [row] });
        interaction.reply({ ephemeral, content: `**${user.username}**, sistema de ticket configurado com sucesso` })
    },
})