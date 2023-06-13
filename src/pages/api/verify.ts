import { withIronSessionApiRoute } from "iron-session/next";
import { type NextApiRequest, type NextApiResponse } from "next";
import { SiweMessage } from "siwe";
import { ironOptions } from "../../lib/iron";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (!method) return res.status(405).end(`No Method`);
  switch (method) {
    case "POST":
      try {
        const body = req.body as { message: string; signature: string };
        const siweMessage = new SiweMessage(body?.message);
        const { success, error, data } = await siweMessage.verify({
          signature: body?.signature,
        });

        if (!success) throw error;

        if (data.nonce !== req.session.nonce)
          return res.status(422).json({ message: "Invalid nonce." });

        req.session.siwe = data;
        await req.session.save();
        res.json({ ok: true });
      } catch (_error) {
        res.json({ ok: false });
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withIronSessionApiRoute(handler, ironOptions);
