/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { act, renderHook, waitFor } from "@testing-library/react";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { usePublicClient, useWalletClient } from "wagmi";
import { useToast } from "~/components/ui/use-toast";
import { useDeploy } from "~/hooks/useDeploy";
import { type DeployVoucherInput } from "~/server/api/routers/voucher";
import { api } from "../../src/utils/api";

vi.mock("~/components/ui/use-toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<object>();
  return {
    ...actual,
    usePublicClient: vi.fn(),
    useWalletClient: vi.fn(),
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
  contractVersion: "1.0.0",
};

describe("useDeploy hook", () => {
  let publicClientMock: Mock, walletClientMock: Mock, toastMock: Mock;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    publicClientMock = {
      waitForTransactionReceipt: vi.fn(),
    };
    walletClientMock = {
      deployContract: vi.fn(),
      writeContract: vi.fn(),
    };
    toastMock = {
      toast: vi.fn(),
    };
    vi.mocked(useToast).mockReturnValue(toastMock);
    vi.mocked(usePublicClient).mockReturnValue(publicClientMock);
    vi.mocked(useWalletClient).mockReturnValue({ data: walletClientMock });
  });
  it.skip("should handle successful deploy", async () => {
    publicClientMock.waitForTransactionReceipt.mockResolvedValueOnce({
      contractAddress: "0xD969e121939Ca0230aF31aa23D8553B6d4489082",
    });
    walletClientMock.deployContract.mockResolvedValue("hash");
    (api.voucher.deploy.useMutation as Mock).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue("voucher"),
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
          (useWalletClient as Mock).mockReturnValue(walletClient);
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
