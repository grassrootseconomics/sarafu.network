import { withIronSessionApiRoute } from "iron-session/next";
import { type NextApiRequest, type NextApiResponse } from "next";
import { ironOptions } from "../../lib/iron";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case "GET":
      res.send({ address: req.session.siwe?.address });
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method || "None"} Not Allowed`);
  }
};

export default withIronSessionApiRoute(handler, ironOptions);
