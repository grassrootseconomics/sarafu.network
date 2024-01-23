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

export const sendVoucherEmbed = (
  voucher: {
    voucher_name: string;
    symbol: string;
    voucher_description: string;
    voucher_address: string;
    voucher_email?: string | null;
    location_name?: string | null;
    voucher_website?: string | null;
  },
  type: "Create" | "Delete"
) => {
  const fields = [
    { name: "Symbol", value: voucher.symbol, inline: true },
    { name: "Address", value: voucher.voucher_address },
  ];

  if (voucher.voucher_email) {
    fields.push({ name: "Email", value: voucher.voucher_email });
  }

  if (voucher.location_name) {
    fields.push({
      name: "Location",
      value: voucher.location_name,
      inline: true,
    });
  }

  if (voucher.voucher_website) {
    fields.push({
      name: "Website",
      value: voucher.voucher_website,
      inline: true,
    });
  }

  const embed = new EmbedBuilder()
    .setColor(type === "Create" ? "#5eda69" : "#ff6961") // Set the color of the embed
    .setTitle(`${voucher.voucher_name} Voucher ${type}d`)
    .setDescription(voucher.voucher_description)
    .addFields(...fields)
    .setTimestamp()
    .setURL("https://sarafu.network/vouchers/" + voucher.voucher_address)
    .setFooter({
      text: "Voucher Details",
      iconURL: "https://sarafu.network/apple-touch-icon.png",
    });

  sendMessage({ embeds: [embed] });
};
