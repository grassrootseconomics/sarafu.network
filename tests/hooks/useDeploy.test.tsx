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
  voucherName: "voucherName",
  voucherDescription: "voucherDescription",
  symbol: "symbol",
  locationName: "locationName",
  supply: 1,
  geo: {
    x: 1,
    y: 2,
  },
  demurrageRate: 2 / 100,
  periodMinutes: 43800,
  sinkAddress: "0xd969e121939ca0230af31aa23d8553b6d4489020",
};

describe("useDeploy hook", () => {
  let publicClientMock: {
    waitForTransactionReceipt: jest.Mock;
  };
  let walletClientMock: {
    deployContract: jest.Mock;
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
    };
    toastMock = {
      toast: jest.fn(),
    };
    (useToast as jest.Mock).mockReturnValue(toastMock);
    (usePublicClient as jest.Mock).mockReturnValue(publicClientMock);
    (useWalletClient as jest.Mock).mockReturnValue({ data: walletClientMock });
  });

  it("should handle successful deploy", async () => {
    publicClientMock.waitForTransactionReceipt.mockResolvedValueOnce({
      contractAddress: "0xd969e121939ca0230af31aa23d8553b6d4489082",
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
        "0xd969e121939ca0230af31aa23d8553b6d4489082"
      );
    });
    expect(api.voucher.deploy.useMutation().mutateAsync).toHaveBeenCalledWith({
      demurrageRate: 0.02,
      geo: {
        x: 1,
        y: 2,
      },
      locationName: "locationName",
      periodMinutes: 43800,
      sinkAddress: "0xd969e121939ca0230af31aa23d8553b6d4489020",
      supply: 1,
      symbol: "symbol",
      voucherAddress: "0xD969e121939Ca0230aF31aa23D8553B6d4489082",
      voucherDescription: "voucherDescription",
      voucherName: "voucherName",
    });
    await waitFor(() => {
      expect(result.current.voucher).toBe("voucher");
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
      sinkAddress: "0x123",
      errorMessage: "Invalid Sink address",
    },
    {
      title: "should handle error when no contract address",
      receipt: {},
      errorMessage: "No contract address",
    },
  ];

  errorCases.forEach(
    ({ title, walletClient, sinkAddress, receipt, errorMessage }) => {
      it(title, async () => {
        if (walletClient) {
          (useWalletClient as jest.Mock).mockReturnValue(walletClient);
        }
        const input = { ...mockDeployInput };

        if (sinkAddress) {
          // @ts-expect-error Tests an error case
          input.sinkAddress = sinkAddress;
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
