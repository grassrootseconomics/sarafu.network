import {
  calculateDecayLevel,
  fromFixed,
  toFixed,
} from "../../../src/utils/dmr-helpers"; // Assuming your functions are exported from 'fixed.ts'
const tests = [
  [123.456, BigInt("2277361236363886404607").toString(16)],
  [1.0, BigInt("18446744073709551616").toString(16)],
  [0.9999244444, BigInt("18445350318893015039").toString(16)],
  [0.9999999999444, BigInt("18446744072683913215").toString(16)],
  [1.333120321412, BigInt("24591729388548583423").toString(16)],
] as [number, string][];
describe("toFixed", () => {
  for (const [input, expected] of tests) {
    it(`converts ${input} to ${expected}`, () => {
      expect(toFixed(input).toString(16)).toEqual(expected);
    });
  }
});

describe("fromFixed", () => {
  for (const [expected, input] of tests) {
    it(`converts ${input} to ${expected}`, () => {
      expect(fromFixed(input)).toEqual(expected);
    });
  }
  it("converts a hex string to a float", () => {
    const a = BigInt("2277361236363886404607");
    console.log(a);
    console.log(a.toString(16));

    console.log(BigInt("2277361236363886404607").toString(16));
    expect(fromFixed(BigInt("2277361236363886404607").toString(16))).toEqual(
      123.456
    );
  });
});

describe("toFixed(fromFixed)", () => {
  for (const [expected, input] of tests) {
    it(`converts ${input} to ${expected} and back to ${input}`, () => {
      const e = fromFixed(input);
      const r = toFixed(e);
      expect(r.toString(16)).toEqual(input);
    });
  }
});

describe("calculateDecayLevel", () => {
  it(`calculates the correct decay level 2% 43800`, () => {
    const decaylevel = calculateDecayLevel(0.02, BigInt(43800));
    expect(decaylevel).toEqual(BigInt("18446735565168785407"));
  });
});
