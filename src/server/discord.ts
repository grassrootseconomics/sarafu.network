import {
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  TextChannel,
  type MessageCreateOptions,
  type MessagePayload,
} from "discord.js";
import { celoscanUrl } from "~/utils/celo";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = "1196746299479957504"; // Voucher-Tracker

export default async function sendMessage(
  message: string | MessagePayload | MessageCreateOptions
) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });

  try {
    await client.login(DISCORD_BOT_TOKEN);
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel instanceof TextChannel) {
      return channel.send(message);
    } else {
      console.error("Channel not found");
    }
  } catch (error) {
    console.error("Failed to send message to Discord", error);
  } finally {
    client
      .destroy()
      .then(() => console.log("Client destroyed"))
      .catch(console.error);
  }
}

export const sendVoucherEmbed = async (
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

  await sendMessage({ embeds: [embed] });
};

export const sendGasRequestedEmbed = async () => {
  const embed = new EmbedBuilder()
    .setColor("#5eda69") // Set the color of the embed
    .setTitle(`👀 Somebody just requested a Social Account`)
    .setDescription(
      "Head over to the Staff Dashboard to approve or deny the request."
    )
    .addFields([])
    .setTimestamp()
    .setURL("https://sarafu.network/staff/")
    .setFooter({
      text: "Staff Dashboard",
      iconURL: "https://sarafu.network/apple-touch-icon.png",
    });

  await sendMessage({ embeds: [embed] });
};

export const sendGasAutoApprovedEmbed = async (address: `0x${string}`) => {
  const embed = new EmbedBuilder()
    .setColor("#5eda69") // Set the color of the embed
    .setTitle(`✅ Social Account Auto Approved`)
    .setDescription(`${address} was just auto approved for a Social Account.`)
    .addFields([])
    .setTimestamp()
    .setURL(celoscanUrl.address(address))
    .setFooter({
      text: "Staff Dashboard",
      iconURL: "https://sarafu.network/apple-touch-icon.png",
    });

  await sendMessage({ embeds: [embed] });
};


export const sendNewPoolEmbed = async (address: `0x${string}`) => {
  const embed = new EmbedBuilder()
    .setColor("#5eda69") // Set the color of the embed
    .setTitle(`🔄 New Pool Deployed`)
    .setDescription(`${address} was just deployed for a Swap Pool.`)
    .addFields([])
    .setTimestamp()
    .setURL(`https://sarafu.network/pools/${address}`)
    .setFooter({
      text: "Staff Dashboard",
      iconURL: "https://sarafu.network/apple-touch-icon.png",
    });

  await sendMessage({ embeds: [embed] });
};