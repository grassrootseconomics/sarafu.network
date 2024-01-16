import {
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  TextChannel,
  type MessageCreateOptions,
  type MessagePayload,
} from "discord.js";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = "1196746299479957504"; // Voucher-Tracker

export default function sendMessage(
  message: string | MessagePayload | MessageCreateOptions
) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });

  client
    .login(DISCORD_BOT_TOKEN)
    .then(() => client.channels.fetch(CHANNEL_ID))
    .then((channel) => {
      if (channel instanceof TextChannel) {
        return channel.send(message);
      }
    })
    .catch(console.error)
    .finally(() => {
      client
        .destroy()
        .then(() => console.log("Client destroyed"))
        .catch(console.error);
    });
}

export const sendVoucherCreatedMessage = (voucher: {
  voucher_name: string;
  symbol: string;
  voucher_description: string;
  voucher_address: string;
  voucher_email: string | null;
  location_name: string | null;
  voucher_website: string | null;
}) => {
  const embed = new EmbedBuilder()
    .setColor("#5eda69") // Set the color of the embed
    .setTitle(`${voucher.voucher_name} Voucher Created`)
    .setDescription(voucher.voucher_description)
    .addFields(
      { name: "Symbol", value: voucher.symbol, inline: true },
      { name: "Address", value: voucher.voucher_address },
      { name: "Email", value: voucher.voucher_email || "" },
      { name: "Location", value: voucher.location_name || "", inline: true },
      { name: "Website", value: voucher.voucher_website || "", inline: true }
    )
    .setTimestamp()
    .setURL("https://sarafu.network/vouchers/" + voucher.voucher_address)
    .setFooter({
      text: "Voucher Details",
      iconURL: "https://sarafu.network/apple-touch-icon.png",
    });

  sendMessage({ embeds: [embed] });
};
