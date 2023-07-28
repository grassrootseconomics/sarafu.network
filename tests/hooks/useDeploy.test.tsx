/* eslint-disable @typescript-eslint/ban-ts-comment */
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePublicClient, useWalletClient } from "wagmi";
import { useDeploy } from "~/hooks/useDeploy";
import { api } from "../../src/utils/api";

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

describe("useDeploy hook", () => {
  it("should handle successful deploy", async () => {
    const publicClientMock = {
      waitForTransactionReceipt: jest.fn().mockResolvedValueOnce({
        contractAddress: "0xd969e121939ca0230af31aa23d8553b6d4489082",
      }),
    };
    const walletClientMock = {
      deployContract: jest.fn().mockResolvedValue("hash"),
    };

    (usePublicClient as jest.Mock).mockReturnValue(publicClientMock);
    (useWalletClient as jest.Mock).mockReturnValue({ data: walletClientMock });
    (api.voucher.deploy.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue("voucher"),
    });

    const { result } = renderHook(() => useDeploy());

    act(() => {
      void result.current.deploy({
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
        sinkAddress: "0x123",
      });
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.hash).toBe("hash");
    });

    await waitFor(() => {
      expect(result.current.receipt?.contractAddress).toBe(
        "0xd969e121939ca0230af31aa23d8553b6d4489082"
      );
    });

    await waitFor(() => {
      expect(result.current.voucher).toBe("voucher");
    });
  });

  it("should handle error when no wallet client", async () => {
    (useWalletClient as jest.Mock).mockReturnValue({});

    const { result } = renderHook(() => useDeploy());

    await act(async () => {
      // @ts-expect-error
      await result.current.deploy({
        voucherName: "voucherName",
        symbol: "symbol",
        demurrageRate: 1,
        periodMinutes: 10,
        sinkAddress: "0x123",
      });
    });

    expect(result.current.error).toEqual(new Error("No wallet client"));
    expect(result.current.loading).toBe(false);
  });

  it("should handle error when no contract address", async () => {
    const publicClientMock = {
      waitForTransactionReceipt: jest.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => {
              resolve({});
            }, 50)
          )
      ),
    };
    const walletClientMock = {
      deployContract: jest.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => {
              resolve("hash");
            }, 50)
          )
      ),
    };

    (usePublicClient as jest.Mock).mockReturnValue(publicClientMock);
    (useWalletClient as jest.Mock).mockReturnValue({ data: walletClientMock });

    const { result } = renderHook(() => useDeploy());

    await act(async () => {
      // @ts-expect-error
      await result.current.deploy({
        voucherName: "voucherName",
        symbol: "symbol",
        demurrageRate: 1,
        periodMinutes: 10,
        sinkAddress: "0x123",
      });
    });

    expect(result.current.error).toEqual(new Error("No contract address"));
    expect(result.current.loading).toBe(false);
  });
});
