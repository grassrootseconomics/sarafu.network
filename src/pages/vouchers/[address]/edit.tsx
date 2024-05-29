import { createServerSideHelpers } from "@trpc/react-query/server";
import { type GetStaticPaths, type GetStaticPropsContext } from "next";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { appRouter } from "~/server/api/root";
import { api } from "~/utils/api";

import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import UpdateVoucherForm from "~/components/voucher/forms/update-voucher-form";
import { kysely } from "~/server/db";
import SuperJson from "~/utils/trpc-transformer";

export async function getStaticProps(
  context: GetStaticPropsContext<{ address: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      kysely: kysely,
      session: undefined,
    },
    transformer: SuperJson, // optional - adds superjson serialization
  });
  const address = context.params?.address as string;
  // prefetch `post.byId`
  await helpers.voucher.byAddress.prefetch({
    voucherAddress: address,
  });
  return {
    props: {
      trpcState: helpers.dehydrate(),
      address,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  };
}
export const getStaticPaths: GetStaticPaths = async () => {
  const vouchers = await kysely
    .selectFrom("vouchers")
    .select("voucher_address")
    .execute();
  return {
    paths: vouchers.map((v) => ({
      params: {
        address: v.voucher_address,
      },
    })),
    // https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-blocking
    fallback: "blocking",
  };
};

const VoucherPage = () => {
  const router = useRouter();
  const voucher_address = router.query.address as `0x${string}`;
  const { data: voucher } = api.voucher.byAddress.useQuery({
    voucherAddress: voucher_address,
  });

  if (!voucher) return <div>Voucher not Found</div>;
  return (
    <>
      <Head>
        <title>{`${voucher.voucher_name}`}</title>
        <meta
          name="description"
          content={voucher.voucher_description}
          key="desc"
        />
        <meta property="og:title" content={`${voucher.voucher_name}`} />
        <meta property="og:description" content={voucher.voucher_description} />
      </Head>
      <div className="max-w-screen-2xl mx-auto px-4 w-full min-h-screen">
        <div className="flex justify-between">
          <h1 className="text-5xl mt-8 mb-4 font-normal text-primary">
            {voucher.voucher_name}{" "}
            <span className="font-bold">({voucher.symbol})</span>
          </h1>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Voucher Details</CardTitle>
            </CardHeader>
            <CardContent>
              <UpdateVoucherForm
                voucher={voucher}
                onSuccess={() => toast.success("Voucher Updated Successfully")}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default VoucherPage;
