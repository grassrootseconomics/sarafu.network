/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { usePublicClient, useWalletClient } from "wagmi";
import { useVoucherDeploy } from "~/hooks/useVoucherDeploy";
import { type DeployVoucherInput } from "~/server/api/routers/voucher";
import { api } from "../../src/utils/api";

vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  return {
    ...actual,
    usePublicClient: vi.fn(),
    useWalletClient: vi.fn(),
  };
});
vi.mock("viem", async (importOriginal) => {
  const actual = await importOriginal<typeof import("viem")>();
  return {
    ...actual,
    getAddress: (address: string) => address,
  };
});

vi.mock("../../src/utils/api", () => ({
  api: {
    voucher: {
      deploy: {
        useMutation: vi.fn(),
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
  contractVersion: "0.5.7",
};

describe("useDeploy hook", () => {
  let publicClientMock: {}, walletClientMock: {};

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    publicClientMock = {
      waitForTransactionReceipt: vi.fn(),
    };
    walletClientMock = {
      account: {
        address: "0x123",
      },
      deployContract: vi.fn(),
      writeContract: vi.fn(),
    };

    vi.mocked(usePublicClient).mockReturnValue(publicClientMock);
    vi.mocked(useWalletClient).mockReturnValue({ data: walletClientMock });
  });
  it("should handle successful deploy", async () => {
    publicClientMock.waitForTransactionReceipt.mockResolvedValueOnce({
      contractAddress: "0xD969e121939Ca0230aF31aa23D8553B6d4489082",
    });
    walletClientMock.deployContract.mockResolvedValue("hash");
    (api.voucher.deploy.useMutation as Mock).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue("voucher"),
    });
    walletClientMock.writeContract.mockResolvedValue("minthash");

    const { result } = renderHook(() => useVoucherDeploy());
    act(() => {
      void result.current.deploy(mockDeployInput);
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    expect(result.current.hash).toBe("hash");

    expect(publicClientMock.waitForTransactionReceipt).toHaveBeenCalledWith({
      hash: "hash",
    });
    expect(result.current.receipt.contractAddress).toBe(
      "0xD969e121939Ca0230aF31aa23D8553B6d4489082"
    );
    // expect(result.current).toEqual({ test: "receipt" });
    await waitFor(() => {
      expect(api.voucher.deploy.useMutation().mutateAsync).toHaveBeenCalledWith(
        {
          ...mockDeployInput,
          voucherAddress: "0xD969e121939Ca0230aF31aa23D8553B6d4489082",
        }
      );
    });
    expect(walletClientMock.writeContract).toHaveBeenCalledOnce();
    expect(publicClientMock.waitForTransactionReceipt).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(result.current.info).toBe(
        "Deployment complete! Please wait while we redirect you."
      );
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
      errorMessage: "No valid contract address found",
    },
  ];

  errorCases.forEach(
    ({ title, walletClient, expiration, receipt, errorMessage }) => {
      it(title, async () => {
        if (walletClient) {
          (useWalletClient as Mock).mockReturnValue(walletClient);
        } else {
          walletClientMock.deployContract.mockResolvedValue("hash");
          (api.voucher.deploy.useMutation as Mock).mockReturnValue({
            mutateAsync: vi.fn().mockResolvedValue("voucher"),
          });
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

        const { result } = renderHook(() => useVoucherDeploy());
        try {
          await act(async () => {
            await result.current.deploy(input);
          });
          expect(true).toBe(false); // Ensure that the deploy function throws an error
        } catch (error) {
          expect(error.message).toBeDefined(errorMessage);
        }

        expect(result.current.loading).toBe(false);
      });
    }
  );
});
