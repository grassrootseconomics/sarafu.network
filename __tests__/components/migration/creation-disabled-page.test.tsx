import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreationDisabledPage } from "~/components/migration/creation-disabled-page";
import { CreationDisabledProvider } from "~/components/migration/creation-disabled-provider";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("CreationDisabledPage", () => {
  it("opens the shared modal and returns to existing content when closed", () => {
    render(
      <CreationDisabledProvider>
        <CreationDisabledPage resource="pool" fallbackHref="/pools" />
      </CreationDisabledProvider>,
    );

    expect(
      screen.getByRole("dialog", {
        name: /create new pools on cosmo-local credit/i,
      }),
    ).toBeTruthy();

    const closeButton = screen
      .getAllByRole("button", { name: "Close" })
      .find((button) => button.textContent === "Close");
    fireEvent.click(closeButton!);

    expect(replace).toHaveBeenCalledWith("/pools");
  });
});
