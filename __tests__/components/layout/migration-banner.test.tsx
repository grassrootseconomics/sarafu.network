import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MigrationBanner } from "~/components/layout/migration-banner";

afterEach(cleanup);

describe("MigrationBanner", () => {
  it("communicates the migration deadline and destinations", () => {
    render(<MigrationBanner />);

    const notice = screen.getByRole("region", {
      name: /migrate your sarafu account/i,
    });
    expect(notice.textContent).toContain("30 October 2026");
    expect(notice.textContent).toContain("Google sign-in");

    expect(
      screen.getByRole("link", { name: /migrate now/i }).getAttribute("href"),
    ).toBe("https://cosmolocal.credit");
    expect(
      screen
        .getByRole("link", { name: "info@grassecon.org" })
        .getAttribute("href"),
    ).toBe("mailto:info@grassecon.org");
  });
});
