import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CreationDisabledProvider,
  useCreationDisabled,
} from "~/components/migration/creation-disabled-provider";

afterEach(cleanup);

function OpenMigrationNotice({ onClose }: { onClose?: () => void }) {
  const { openCreationDisabled } = useCreationDisabled();
  return (
    <button
      type="button"
      onClick={() => openCreationDisabled("offer", { onClose })}
    >
      Add Offer
    </button>
  );
}

describe("CreationDisabledProvider", () => {
  it("shows the shared migration message and working links", () => {
    render(
      <CreationDisabledProvider>
        <OpenMigrationNotice />
      </CreationDisabledProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Offer" }));

    expect(
      screen.getByRole("dialog", {
        name: /create new offers on cosmo-local credit/i,
      }),
    ).toBeTruthy();
    expect(screen.getByText(/30 October 2026/)).toBeTruthy();
    expect(screen.getByText(/not transferred automatically/i)).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: /go to cosmo-local credit/i })
        .getAttribute("href"),
    ).toBe("https://cosmolocal.credit");
    expect(
      screen
        .getByRole("link", { name: "info@grassecon.org" })
        .getAttribute("href"),
    ).toBe("mailto:info@grassecon.org");
  });

  it("runs the caller's close action", () => {
    const onClose = vi.fn();
    render(
      <CreationDisabledProvider>
        <OpenMigrationNotice onClose={onClose} />
      </CreationDisabledProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Offer" }));
    const closeButton = screen
      .getAllByRole("button", { name: "Close" })
      .find((button) => button.textContent === "Close");
    expect(closeButton).toBeTruthy();
    fireEvent.click(closeButton!);

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
