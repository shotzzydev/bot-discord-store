// type ChannelInfo = {
//     id: string;
//     url: string;
// }

interface cfgTicket {
    channel_transcripts: string,
    category_buy: string,
    category_support: string,
    category_partnering: string,
    role_support: string,
}

export interface GuildDocument {
    ticket?: cfgTicket,
};