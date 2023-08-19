import type { NextPage } from "next";
import { Card, CardContent } from "~/components/ui/card";
import { Loading } from "../components/loading";
import PublishVoucherForm from "../components/voucher/publish-voucher-form";
import { useDeploy } from "../hooks/useDeploy";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const { deploy, loading, receipt, hash, info, voucher } = useDeploy();
  const router = useRouter();
  if(voucher) {
    void router.push(`/vouchers/${voucher.voucher_address}`);
  }
  let content;
  if (loading) {
    content = <Loading status={info} />;
  } else if (receipt) {
    content = (
      <div>
        <p>Transaction Hash: {hash}</p>
        <div>Contract Address: {receipt.contractAddress}</div>
      </div>
    );
  } else {
    content = (
      <PublishVoucherForm
        onSubmit={(data) => {
          void deploy(data);
        }}
      />
    );
  }

  return (
    <div className="container p-4">
      <Card className="pt-4 max-w-lg m-auto">
        <CardContent>{content}</CardContent>
      </Card>
    </div>
  );
};

export default Home;
