import type { NextPage } from "next";
import { Card, CardContent } from "~/components/ui/card";
import { Loading } from "../components/Loading";
import PublishVoucherForm from "../components/Voucher/PublishVoucherForm";
import { useDeploy } from "../hooks/useDeploy";

const Home: NextPage = () => {
  const { deploy, loading, error, receipt, hash, info } = useDeploy();

  return (
    <div>
      <div className="container">
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <Card className="pt-4">
          <CardContent>
            <PublishVoucherForm
              onSubmit={(data) => {
                void deploy(data);
              }}
            />
          </CardContent>
        </Card>
      </div>
      {loading && <Loading status={info} />}
      {hash && <p>Transaction Hash: {hash}</p>}
      {receipt && <div>Contract Address: {receipt?.contractAddress}</div>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default Home;
