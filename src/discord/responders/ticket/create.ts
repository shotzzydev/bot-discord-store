
import { Responder, ResponderType } from "#base";
import { db } from "#database";
import { settings } from "#settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle, CategoryChannelResolvable, ChannelType, EmbedBuilder } from "discord.js";

new Responder({
    customId: "ticket/create/channel",
    type: ResponderType.StringSelect, cache: "cached",
    async run(interaction) {
        const { user, guild } = interaction;
        const roleManager = interaction.guild?.roles;

        interaction.deferReply({
            ephemeral,
        });

        db.guilds.get(db.guilds.id(guild.id))
            .then((guildDocument) => {
                if (guildDocument) {
                    const role_support = guildDocument.data?.ticket?.role_support;

                    const very = guildDocument.data?.ticket?.[interaction.values[0] as keyof typeof guildDocument.data.ticket];

                    let category: string;
                    const ticketOpen = interaction.guild?.channels.cache.find((ticket) => ticket.type === ChannelType.GuildText && ticket.topic === interaction.user.id);
                    const categorySelec = interaction.values[0];

                    switch (categorySelec) {
                        case "category_buy": {
                            category = "Compras"
                            break
                        }
                        case "category_support": {
                            category = "Suporte"
                            break
                        }
                        case "category_partnering": {
                            category = "Parceria"
                            break
                        }
                    }

                    if (ticketOpen) {
                        const embed = new EmbedBuilder({
                            title: "Ticket Em Andamento",
                            description: `**${user.username}** você já possui um ticket em andamento acesse o clicando no botão abaixo, após o fechamento do seu ticket você pordera realizar a abertura de outro`,
                            color: hexToRgb(settings.colors.danger)
                        });

                        const button = createRow(
                            new ButtonBuilder({
                                label: "Acesse seu ticket",
                                emoji: "🔗",
                                style: ButtonStyle.Link,
                                url: `https://discord.com/channels/${interaction.guild?.id}/${ticketOpen.id}`
                            })
                        );

                        interaction.reply({ ephemeral, embeds: [embed], components: [button] });
                        return;
                    }

                    const categoriaParaEmoji: { [key: string]: string } = {
                        "category_buy": "💸",
                        "category_support": "🛠️",
                        "category_partnering": "🤝",
                    };

                    const emoji = categoriaParaEmoji[categorySelec];
                    const canal = guild.channels;
                    const categoria = very;

                    const categoriaParaCargo: { [key: string]: string } = {
                        category_buy: role_support || "",
                        category_support: role_support || "",
                        category_partnering: role_support || "",
                    };

                    const cargoSelecionado = categoriaParaCargo[interaction.values[0]];

                    roleManager?.fetch(cargoSelecionado).catch(() => null);

                    canal.create({
                        name: `${emoji}-ticket-${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        parent: categoria as CategoryChannelResolvable,
                        topic: `${interaction.user.id}`,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.roles.everyone.id,
                                deny: ["ViewChannel"],
                                allow: ["ViewAuditLog", "SendMessages"],
                            },
                            {
                                id: interaction.user.id,
                                allow: ["ViewChannel", "ViewAuditLog", "SendMessages", "AttachFiles"]
                            },
                            {
                                id: `${cargoSelecionado}`,
                                allow: ["SendMessages", "ViewChannel", "AttachFiles", "EmbedLinks", "AddReactions", "ViewAuditLog"]
                            }
                        ]
                    })
                        .then((canal) => {
                            const embed = new EmbedBuilder({
                                thumbnail: {
                                    url: `${guild.iconURL()}`
                                },
                                description: `Olá **${interaction.user.globalName}**, seja bem-vindo(a) ao seu ticket. Por favor, informe o seu assunto para que possamos fornecer ajuda o mais rápido possível.\n\n**Assunto relacionado pela abertura**:\n \`\`\`${category}\`\`\`\n> Para todos os responsáveis conseguirem ter acesso a todas às funcionalidade que porde ser realizada sobre esse atendimento, Acessar o clicando no botão **Painel Ticket**.`,
                                color: hexToRgb(settings.colors.default)
                            });

                            const row = createRow(
                                new ButtonBuilder({
                                    customId: "staff/painel/panel",
                                    style: ButtonStyle.Primary,
                                    label: "Painel Ticket",
                                })
                            );

                            canal.send({
                                content: `<@&${cargoSelecionado}>`,
                                embeds: [embed],
                                components: [row]
                            });

                            const link = new EmbedBuilder({
                                description: `**${user.username}**, seu ticket foi criado com sucesso, clique no botão a baixo\npara ser redirecionado para o canal do ticket`,
                                color: hexToRgb(settings.colors.success)
                            });

                            const row2 = createRow(
                                new ButtonBuilder({
                                    emoji: "🔗",
                                    label: "Acesse seu ticket",
                                    style: ButtonStyle.Link,
                                    url: `https://discord.com/channels/${guild.id}/${canal.id}`
                                })
                            );

                          interaction.editReply({ embeds: [link], components: [row2] })
                        })
                }
            }
            )
    }
})