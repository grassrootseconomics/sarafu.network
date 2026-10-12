import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OnboardingPage } from "~/components/onboarding/onboarding-page";

const mocks = vi.hoisted(() => ({
  auth: {
    session: {
      user: { onboarding_completed: false },
    },
    user: { given_names: null },
  } as ReturnType<typeof import("~/hooks/use-auth").useAuth>,
  openConnectModal: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("~/hooks/use-auth", () => ({
  useAuth: () => mocks.auth,
}));

vi.mock("@rainbow-me/rainbowkit", () => ({
  useConnectModal: () => ({ openConnectModal: mocks.openConnectModal }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("~/components/onboarding/steps/profile-step", () => ({
  ProfileStep: ({ onComplete }: { onComplete: () => void }) => (
    <button type="button" onClick={onComplete}>
      Complete existing profile
    </button>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OnboardingPage", () => {
  it("keeps profile completion and skips new Offer and Voucher stages", () => {
    render(<OnboardingPage />);

    expect(
      screen.getByRole("button", { name: "Complete existing profile" }),
    ).toBeTruthy();
    expect(screen.queryByText(/create offer/i)).toBeNull();
    expect(screen.queryByText(/create voucher/i)).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Complete existing profile" }),
    );
    expect(mocks.replace).toHaveBeenCalledWith("/wallet");
  });
});
