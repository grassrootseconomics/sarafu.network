import { TRPCError } from "@trpc/server";
import { isAddress } from "viem";
import { z } from "zod";
import { publicClient } from "~/config/viem.config.server";
import { EthFaucet } from "~/contracts/eth-faucet";
import { registerENS } from "~/lib/sarafu/resolver";
import { router, staffProcedure } from "~/server/api/trpc";
import { GasGiftStatus } from "~/server/enums";
import { UserModel } from "../models/user";

/**
 * Generate a random ENS hint for wallet creation
 */
function generateRandomENSHint(): string {
  const adjectives = [
    "swift",
    "calm",
    "bold",
    "wise",
    "kind",
    "brave",
    "fair",
    "pure",
    "true",
    "free",
    "wild",
    "rich",
    "cool",
    "warm",
    "light",
    "quiet",
    "proud",
    "noble",
    "azure",
    "keen",
    "loyal",
    "fresh",
    "young",
    "old",
    "new",
    "dark",
    "clear",
    "deep",
    "high",
    "low",
    "fast",
    "slow",
    "wide",
    "thick",
    "thin",
    "heavy",
    "soft",
    "hard",
    "rough",
    "wet",
    "dry",
    "hot",
    "cold",
    "sweet",
    "sour",
    "salty",
    "spicy",
    "mild",
    "weak",
    "loud",
    "solid",
    "lunar",
    "solar",
    "sharp",
    "quick",
    "stern",
    "tight",
    "loose",
    "sleek",
    "crisp",
    "dense",
    "blank",
    "plain",
    "grand",
    "small",
    "large",
    "tiny",
    "huge",
    "broad",
    "tall",
    "short",
    "nice",
    "good",
    "great",
    "fine",
    "rare",
    "real",
    "full",
    "empty",
    "close",
    "far",
    "near",
    "cheap",
    "dear",
    "early",
    "late",
    "safe",
    "risky",
    "lucky",
    "smart",
    "dull",
    "sharp",
    "blunt",
    "clean",
    "dirty",
    "fresh",
    "stale",
    "sweet",
    "bland",
    "spicy",
    "mild",
    "harsh",
    "gentle",
    "tough",
  ];

  const nouns = [
    "eagle",
    "tiger",
    "lion",
    "wolf",
    "bear",
    "fox",
    "deer",
    "owl",
    "hawk",
    "dove",
    "star",
    "moon",
    "sun",
    "tree",
    "river",
    "ocean",
    "stone",
    "flame",
    "storm",
    "wind",
    "rain",
    "snow",
    "ice",
    "fire",
    "earth",
    "water",
    "air",
    "sky",
    "cloud",
    "dawn",
    "dusk",
    "night",
    "day",
    "hill",
    "peak",
    "field",
    "leaf",
    "root",
    "seed",
    "fruit",
    "berry",
    "nut",
    "grain",
    "herb",
    "moss",
    "fern",
    "grass",
    "oak",
    "pine",
    "maple",
    "birch",
    "cedar",
    "palm",
    "coral",
    "shell",
    "pearl",
    "wave",
    "tide",
    "lake",
    "pond",
    "marsh",
    "swamp",
    "shore",
    "beach",
    "cliff",
    "cave",
    "path",
    "trail",
    "road",
    "gate",
    "door",
    "tower",
    "bird",
    "fish",
    "horse",
    "snake",
    "frog",
    "bee",
    "ant",
    "fly",
    "moth",
    "spider",
    "crab",
    "whale",
    "shark",
    "seal",
    "otter",
    "duck",
    "goose",
    "swan",
    "crane",
    "robin",
    "wren",
    "jay",
    "crow",
    "raven",
    "rose",
    "lily",
    "tulip",
    "daisy",
    "iris",
    "sage",
    "mint",
    "basil",
    "thyme",
    "oak",
    "elm",
    "ash",
    "yew",
    "vine",
    "bush",
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adjective}-${noun}.sarafu.eth`;
}

export const staffRouter = router({
  /**
   * Create a new wallet with NFC association
   * - Registers the wallet address in the database
   * - Approves for gas sponsorship
   * - Assigns random ENS name
   */
  createWallet: staffProcedure
    .input(
      z.object({
        address: z.string().refine(isAddress, { message: "Invalid address" }),
        userIdentifier: z.number().optional(),
        autoApproveGas: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const staffId = ctx.session.user.account_id;
      if (!staffId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid staff member",
        });
      }

      try {
        // Check if address already exists
        const existingAccount = await ctx.graphDB
          .selectFrom("accounts")
          .where("blockchain_address", "=", input.address)
          .select(["id", "gas_gift_status"])
          .executeTakeFirst();

        if (existingAccount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Wallet address already exists in the system",
          });
        }

        const userModel = new UserModel(ctx.graphDB);
        // Create account in database with required fields
        const userId = await userModel.createUser(input.address);

        // Register ENS name
        // Generate random ENS hint
        const ensHint = generateRandomENSHint();
        let ensName: string;
        try {
          ensName = await registerENS(input.address, ensHint);
        } catch (error) {
          console.error("ENS registration failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to register ENS name for wallet",
          });
        }
        // Approve for gas sponsorship if requested
        let gasApproved = false;
        if (input.autoApproveGas) {
          try {
            const ethFaucet = new EthFaucet(publicClient);
            const registry = await ethFaucet.registry();
            const isRegistered = await registry.isActive(input.address);

            if (!isRegistered) {
              const transactionReceipt = await registry.add(input.address);
              if (transactionReceipt.status === "success") {
                await userModel.updateGasGiftStatus(
                  userId,
                  GasGiftStatus.APPROVED
                );

                try {
                  await ethFaucet.giveTo(input.address);
                  gasApproved = true;
                } catch (error) {
                  console.error("Gas gift failed:", error);
                  // Don't fail the whole operation if gas gift fails
                }
              } else {
                console.error("Failed to register address for gas sponsorship");
                // Don't fail the whole operation if gas registration fails
              }
            } else {
              gasApproved = true; // Already registered
            }
          } catch (error) {
            console.error("Gas sponsorship setup failed:", error);
            // Don't fail the whole operation if gas sponsorship fails
          }
        }
        return {
          success: true,
          address: input.address,
          ensName,
          gasApproved,
          message: "Wallet created successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Wallet creation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create wallet",
        });
      }
    }),
});
