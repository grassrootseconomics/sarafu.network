import { useRouter } from "next/router";
import { useEffect } from "react";
import { StepControls } from "../controls";
import { type FormSchemaType, useVoucherData } from "../provider";
import { objectToBase64 } from "../utils";

export const SigningAndPublishingStep = () => {
  const data = useVoucherData() as FormSchemaType;
  const router = useRouter();
  useEffect(() => {
    const encoded = objectToBase64(data);
    void router.push(`/stepper?data=${encoded}`);
  }, [data]);
  return (
    <div className="w-full rounded-lg p-4 text-left">
      <div className="max-w-screen-lg mx-auto p-5">
        {/* About You */}
        <div className="bg-white p-5 rounded-lg shadow-md mb-5">
          <h2 className="text-2xl font-bold mb-4">About You</h2>
          <p>
            <strong>Type:</strong> {data.aboutYou.type}
          </p>
          <p>
            <strong>Name:</strong> {data.aboutYou.name}
          </p>
          <p>
            <strong>Contact:</strong> {data.aboutYou.contactInformation}
          </p>
          <p>
            <strong>Authorized:</strong> {data.aboutYou.authorized}
          </p>
          <p>
            <strong>Geo:</strong> x: {data.aboutYou.geo.x}, y:{" "}
            {data.aboutYou.geo.y}
          </p>
          <p>
            <strong>Location:</strong> {data.aboutYou.location}
          </p>
        </div>

        {/* Name and Products */}
        <div className="bg-white p-5 rounded-lg shadow-md mb-5">
          <h2 className="text-2xl font-bold mb-4">Name and Products</h2>
          <p>
            <strong>Name:</strong> {data.nameAndProducts.name}
          </p>
          <p>
            <strong>Symbol:</strong> {data.nameAndProducts.symbol}
          </p>
          <p>
            <strong>Products:</strong>{" "}
            {data.nameAndProducts.products
              ?.map((product) => product.value)
              .join(", ")}
          </p>
        </div>

        {/* Value and Supply */}
        <div className="bg-white p-5 rounded-lg shadow-md mb-5">
          <h2 className="text-2xl font-bold mb-4">Value and Supply</h2>
          <p>
            <strong>UOA:</strong> {data.valueAndSupply.uoa}
          </p>
          <p>
            <strong>Value:</strong> {data.valueAndSupply.value}
          </p>
          <p>
            <strong>Supply:</strong> {data.valueAndSupply.supply}
          </p>
        </div>

        {/* Expiration */}
        <div className="bg-white p-5 rounded-lg shadow-md mb-5">
          <h2 className="text-2xl font-bold mb-4">Expiration</h2>

          <p>
            <strong>Type:</strong> {data.expiration.type}
          </p>
          {(data.expiration.type === "both" ||
            data.expiration.type === "date") && (
            <p>
              <strong>Expiration Data:</strong>{" "}
              {new Date(data.expiration.expirationData).toLocaleString()}
            </p>
          )}
          {(data.expiration.type === "both" ||
            data.expiration.type === "gradual") && (
            <>
              <p>
                <strong>Rate:</strong> {data.expiration.rate}
              </p>
              <p>
                <strong>Period:</strong> {data.expiration.period}
              </p>
              <p>
                <strong>Community Fund:</strong> {data.expiration.communityFund}
              </p>
            </>
          )}
        </div>

        {/* Options */}
        <div className="bg-white p-5 rounded-lg shadow-md mb-5">
          <h2 className="text-2xl font-bold mb-4">Options</h2>
          <p>
            <strong>Has Cap:</strong> {data.options.hasCap}
          </p>
          <p>
            <strong>Cap:</strong> {data.options.cap}
          </p>
          <p>
            <strong>Transfer:</strong> {data.options.transfer}
          </p>
          <p>
            <strong>Transfer Address:</strong> {data.options.transferAddress}
          </p>
          <p>
            <strong>Max Capacity Accepted Daily:</strong>{" "}
            {data.options.maxCapacityAcceptedDaily}
          </p>
        </div>
      </div>
      <StepControls />
    </div>
  );
};
