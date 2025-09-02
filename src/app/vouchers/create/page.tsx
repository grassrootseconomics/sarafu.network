import Image from "next/image";
import { ContentContainer } from "~/components/layout/content-container";
import VoucherStepper from "~/components/voucher/forms/create-voucher-form";
export default function StepperDemo() {
  return (
    <ContentContainer title="Create your own Voucher">
      <div className="flex flex-col items-center justify-center mb-6">
        <Image
          src="/home/service-providers-icon.png"
          alt="Stewards icon"
          width={200}
          height={200}
          className="w-[100px] h-[100px] max-w-xs mx-auto rounded-lg"
        />
        <h1 className="text-4xl font-bold my-2"> Create your own Voucher </h1>
      </div>
      <VoucherStepper />
    </ContentContainer>
  );
}
