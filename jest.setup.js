import "@testing-library/jest-dom";

import { TextDecoder, TextEncoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import crypto from "crypto";
Object.defineProperty(global.self, "crypto", {
  value: crypto.webcrypto,
});
