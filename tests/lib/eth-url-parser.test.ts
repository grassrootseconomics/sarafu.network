import { buildEthUrl, parseEthUrl } from "~/lib/eth-url-parser";

describe("parse", () => {
  test("Can parse URI with payload starting with `0x`", () => {
    expect(
      parseEthUrl("ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD")
    ).toEqual({
      scheme: "ethereum",
      target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
    });
  });

  test("Can parse URI with payload starting with `0x` and `pay` prefix", () => {
    expect(
      parseEthUrl("ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD")
    ).toEqual({
      scheme: "ethereum",
      prefix: "pay",
      target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
    });
  });

  test("Can parse URI with payload starting with `0x` and `foo` prefix", () => {
    expect(
      parseEthUrl("ethereum:foo-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD")
    ).toEqual({
      scheme: "ethereum",
      prefix: "foo",
      target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
    });
  });

  test("Can parse URI with an ENS name", () =>
    expect(parseEthUrl("ethereum:foo-doge-to-the-moon.eth")).toEqual({
      scheme: "ethereum",
      prefix: "foo",
      target_address: "doge-to-the-moon.eth",
    }));
  test("Can parse URI with chain id", () =>
    expect(
      parseEthUrl("ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD@42")
    ).toEqual({
      scheme: "ethereum",
      target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      chain_id: "42",
    }));
  test("Can parse an ERC20 token transfer", () =>
    expect(
      parseEthUrl(
        "ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD/transfer?address=0x12345&uint256=1"
      )
    ).toEqual({
      scheme: "ethereum",
      target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      function_name: "transfer",
      parameters: {
        address: "0x12345",
        uint256: "1",
      },
    }));
  test("Can parse a url with value and gas parameters", () =>
    expect(
      parseEthUrl(
        "ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50"
      )
    ).toEqual({
      scheme: "ethereum",
      target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      parameters: {
        value: "2014000000000000000",
        gas: "10",
        gasLimit: "21000",
        gasPrice: "50",
      },
    }));
});

describe("build", () => {
  test("Can build a URL with payload starting with `0x`", () => {
    expect(
      buildEthUrl({
        target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      })
    ).toEqual("ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD");
  });

  test("Can build a URL with payload starting with `0x` and `pay` prefix", () => {
    expect(
      buildEthUrl({
        prefix: "pay",
        target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      })
    ).toEqual("ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD");
  });

  test("Can build a URL with payload starting with `0x` and `foo` prefix", () => {
    expect(
      buildEthUrl({
        prefix: "foo",
        target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
      })
    ).toEqual("ethereum:foo-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD");
  });

  test("Can build a URL with an ENS name", () => {
    expect(
      buildEthUrl({
        prefix: "foo",
        target_address: "doge-to-the-moon.eth",
      })
    ).toEqual("ethereum:foo-doge-to-the-moon.eth");
  });

  test("Can build a URL with chain id", () => {
    expect(
      buildEthUrl({
        target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
        chain_id: "42",
      })
    ).toEqual("ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD@42");
  });

  test("Can build a URL for an ERC20 token transfer", () => {
    expect(
      buildEthUrl({
        target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
        function_name: "transfer",
        parameters: {
          address: "0x12345",
          uint256: "1",
        },
      })
    ).toEqual(
      "ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD/transfer?address=0x12345&uint256=1"
    );
  });

  test("Can build a url with value and gas parameters", () => {
    expect(
      buildEthUrl({
        target_address: "0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD",
        parameters: {
          value: "2014000000000000000",
          gas: "10",
          gasLimit: "21000",
          gasPrice: "50",
        },
      })
    ).toEqual(
      "ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50"
    );
  });
});
