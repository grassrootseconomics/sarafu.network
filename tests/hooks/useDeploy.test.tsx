import { act, renderHook, waitFor } from "@testing-library/react";
import { usePublicClient, useWalletClient } from "wagmi";
import { useToast } from "~/components/ui/use-toast";
import { useDeploy } from "~/hooks/useDeploy";
import { type DeployVoucherInput } from "~/server/api/routers/voucher";
import { api } from "../../src/utils/api";

jest.mock("~/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

jest.mock("wagmi", () => ({
  usePublicClient: jest.fn(),
  useWalletClient: jest.fn(),
}));

jest.mock("../../src/utils/api", () => ({
  api: {
    voucher: {
      deploy: {
        useMutation: jest.fn(),
      },
    },
  },
}));

const mockDeployInput: Omit<DeployVoucherInput, "voucherAddress"> = {
  options: {
    transfer: "no",
  },
  aboutYou: {
    name: "name",
    email: "email",
    geo: {
      x: 1,
      y: 2,
    },
    location: "locationName",
    type: "personal",
    website: "www.sarafu.network",
  },
  expiration: {
    type: "gradual",
    communityFund: "0xEb3907eCad74a0013c259D5874AE7f22DcBcC95C",
    period: 43800,
    rate: 2,
  },
  nameAndProducts: {
    name: "name",
    description: "description",
    symbol: "symbol",
    products: [],
  },
  valueAndSupply: {
    supply: 1,
    value: 1,
    uoa: "BYTES",
  },
  signingAndPublishing: {
    pathLicense: true,
    termsAndConditions: true,
  },
  contractVersion: "1.0.0",
};
// const mintHash = await walletClient.writeContract({
//   abi,
//   address: checksummedAddress,
//   functionName: "mintTo",
//   args: [
//     walletClient.account.address,
//     parseUnits(input.valueAndSupply.supply.toString(), decimals),
//   ],
// });
describe("useDeploy hook", () => {
  let publicClientMock: {
    waitForTransactionReceipt: jest.Mock;
  };
  let walletClientMock: {
    deployContract: jest.Mock;
    writeContract: jest.Mock;
  };
  let toastMock: {
    toast: jest.Mock;
  };
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks

    publicClientMock = {
      waitForTransactionReceipt: jest.fn(),
    };
    walletClientMock = {
      deployContract: jest.fn(),
      writeContract: jest.fn(),
    };
    toastMock = {
      toast: jest.fn(),
    };
    (useToast as jest.Mock).mockReturnValue(toastMock);
    (usePublicClient as jest.Mock).mockReturnValue(publicClientMock);
    (useWalletClient as jest.Mock).mockReturnValue({ data: walletClientMock });
  });

  it.skip("should handle successful deploy", async () => {
    publicClientMock.waitForTransactionReceipt.mockResolvedValueOnce({
      contractAddress: "0xD969e121939Ca0230aF31aa23D8553B6d4489082",
    });
    walletClientMock.deployContract.mockResolvedValue("hash");
    (api.voucher.deploy.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue("voucher"),
    });

    const { result } = renderHook(() => useDeploy());

    act(() => {
      void result.current.deploy(mockDeployInput);
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.hash).toBe("hash");
    });
    expect(publicClientMock.waitForTransactionReceipt).toHaveBeenCalledWith({
      hash: "hash",
    });

    await waitFor(() => {
      expect(result.current.receipt?.contractAddress).toBe(
        "0xD969e121939Ca0230aF31aa23D8553B6d4489082"
      );
    });
    await waitFor(() => {
      expect(api.voucher.deploy.useMutation().mutateAsync).toHaveBeenCalledWith(
        {
          ...mockDeployInput,
          voucherAddress: "0xD969e121939Ca0230aF31aa23D8553B6d4489082",
        }
      );
    });
    await waitFor(() => {
      expect(result.current.info).toBe("Writing to Token Index and CIC Graph");
    });
    await waitFor(() => {
      expect(result.current.info).toBe("Minting");
    });
  });

  const errorCases = [
    {
      title: "should handle error when no wallet client",
      walletClient: {},
      errorMessage: "No wallet client",
    },
    {
      title: "should handle error when invalid sink address",
      expiration: {
        communityFund: "0x123",
      },
      errorMessage: "Invalid Community Fund Address",
    },
    {
      title: "should handle error when no contract address",
      receipt: {},
      errorMessage: "No contract address",
    },
  ];

  errorCases.forEach(
    ({ title, walletClient, expiration, receipt, errorMessage }) => {
      it(title, async () => {
        if (walletClient) {
          (useWalletClient as jest.Mock).mockReturnValue(walletClient);
        }
        const input = { ...mockDeployInput };

        if (expiration) {
          // @ts-expect-error Tests an error case
          input.expiration = { ...input.expiration, ...expiration };
        }
        if (receipt) {
          publicClientMock.waitForTransactionReceipt.mockResolvedValueOnce(
            receipt
          );
        }

        const { result } = renderHook(() => useDeploy());
        await act(async () => {
          await result.current.deploy(input);
        });

        expect(toastMock.toast).toHaveBeenCalledWith({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        expect(result.current.loading).toBe(false);
      });
    }
  );
});
