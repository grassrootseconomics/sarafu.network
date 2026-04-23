export type TransactionContext =
  | {
      type: "transaction";
      to?: string;
      functionName?: string;
      value?: bigint;
      description?: string;
    }
  | { type: "message"; message: string }
  | { type: "typedData"; primaryType: string };

const FUNCTION_LABELS: Record<string, string> = {
  approve: "Token Approval",
  transfer: "Token Transfer",
  transferFrom: "Token Transfer",
  withdraw: "Pool Swap",
};

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getActionLabel(ctx: TransactionContext): string {
  if (ctx.type === "message") return "Sign Message";
  if (ctx.type === "typedData") return `Sign ${ctx.primaryType}`;
  if (ctx.functionName && FUNCTION_LABELS[ctx.functionName]) {
    return FUNCTION_LABELS[ctx.functionName]!;
  }
  return "Contract Interaction";
}

interface PinModalOptions {
  onSuccess: (password: string) => void;
  onCancel: () => void;
  txContext?: TransactionContext;
}

interface PinModalElements {
  overlay: HTMLDialogElement;
  modal: HTMLDialogElement;
  cleanup: () => void;
}

class PinModal {
  private elements: PinModalElements | null = null;
  private options: PinModalOptions;
  private savedBodyOverflow = "";

  constructor(options: PinModalOptions) {
    this.options = options;
  }

  public show(): void {
    this.createModal();
  }

  private createModal(): void {
    // Create dialog element
    const overlay = document.createElement("dialog");
    overlay.className =
      "backdrop:bg-black/50 backdrop:backdrop-blur-sm z-[9999999999] bg-transparent p-0 sm:p-4 md:p-6 max-w-none max-h-none border-0 outline-0 w-full sm:w-auto";

    // Set the modal content directly in the dialog
    overlay.innerHTML = this.getModalHTML();

    document.body.appendChild(overlay);

    // Save and prevent body scroll
    this.savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Show modal
    overlay.showModal();

    this.elements = {
      overlay,
      modal: overlay, // Use the dialog element directly
      cleanup: () => this.cleanup(),
    };

    this.attachEventListeners();
    this.focusInput();
  }

  private getTransactionDetailsHTML(): string {
    const ctx = this.options.txContext;
    if (!ctx) return "";

    const actionLabel = getActionLabel(ctx);

    if (ctx.type === "message") {
      const preview =
        typeof ctx.message === "string"
          ? ctx.message.length > 80
            ? `${ctx.message.slice(0, 80)}...`
            : ctx.message
          : "Binary message";
      return `
        <div class="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span class="text-xs sm:text-sm font-medium text-amber-800">${actionLabel}</span>
          </div>
          <p class="text-xs text-amber-700 break-all">${preview}</p>
        </div>`;
    }

    if (ctx.type === "typedData") {
      return `
        <div class="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-xs sm:text-sm font-medium text-amber-800">${actionLabel}</span>
          </div>
        </div>`;
    }

    // Transaction type
    const heading = ctx.description ?? actionLabel;
    const rows: string[] = [];
    if (ctx.to) {
      rows.push(`
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-500">Contract</span>
          <span class="text-xs font-mono text-gray-700">${shortenAddress(ctx.to)}</span>
        </div>`);
    }
    if (!ctx.description && ctx.functionName) {
      rows.push(`
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-500">Action</span>
          <span class="text-xs font-medium text-gray-700">${actionLabel}</span>
        </div>`);
    }

    return `
      <div class="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1.5">
        <div class="flex items-center gap-2 ${rows.length > 0 ? "mb-2" : ""}">
          <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="text-xs sm:text-sm font-medium text-blue-800">${heading}</span>
        </div>
        ${rows.join("")}
      </div>`;
  }

  private getModalHTML(): string {
    const txDetails = this.getTransactionDetailsHTML();

    return `
      <div class="flex min-h-full items-end sm:items-center justify-center">
        <div class="bg-white sm:rounded-xl shadow-xl w-full sm:max-w-md sm:mx-auto rounded-t-xl sm:rounded-b-xl">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 sm:p-6 border-b bg-gray-50/50 rounded-t-xl">
          <div class="flex items-center gap-3 pr-4">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-base font-semibold text-gray-900">Confirm Action</h2>
              <p class="text-xs text-gray-500 mt-0.5">Enter your wallet password to sign</p>
            </div>
          </div>
          <button
            id="close-btn"
            class="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
            aria-label="Close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Transaction Details -->
        ${txDetails}

        <!-- Content -->
        <form id="password-form" class="p-4 sm:p-6 space-y-4" style="padding-bottom: max(1rem, env(safe-area-inset-bottom))">
          <div class="space-y-2">
            <label for="password-input" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="relative">
              <input
                type="password"
                id="password-input"
                class="w-full px-3 py-3 text-base border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                id="toggle-password"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] justify-center"
              >
                <svg id="eye-closed" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg id="eye-open" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div id="error-message" class="hidden text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span id="error-text" class="text-sm">An error occurred</span>
            </div>
          </div>

          <div class="flex gap-3 pt-1">
            <button
              type="button"
              id="cancel-btn"
              class="flex-1 px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-btn"
              class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-h-[44px] flex items-center justify-center"
            >
              <span id="submit-text">Confirm</span>
              <svg id="submit-spinner" class="hidden w-4 h-4 ml-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </div>
        </form>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    if (!this.elements) return;

    const { overlay, modal } = this.elements;

    // Close handlers
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        this.handleCancel();
      }
    });

    modal
      .querySelector("#close-btn")
      ?.addEventListener("click", () => this.handleCancel());
    modal
      .querySelector("#cancel-btn")
      ?.addEventListener("click", () => this.handleCancel());

    // Escape key handler
    document.addEventListener("keydown", this.handleKeydown);

    // Form submission
    modal
      .querySelector("#password-form")
      ?.addEventListener("submit", this.handleSubmit);

    // Password visibility toggle
    modal
      .querySelector("#toggle-password")
      ?.addEventListener("click", this.togglePasswordVisibility);

    // Input validation
    const passwordInput = modal.querySelector(
      "#password-input",
    ) as HTMLInputElement;
    passwordInput?.addEventListener("input", () => this.clearError());
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      this.handleCancel();
    }
  };

  private handleSubmit = (event: Event): void => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const password = (form.querySelector("#password-input") as HTMLInputElement)
      .value;

    if (!password.trim()) {
      this.showError("Please enter your password");
      return;
    }

    this.setLoading(true);
    this.clearError();

    // Blur input immediately to start keyboard dismissal during loading delay
    const passwordInput = form.querySelector(
      "#password-input",
    ) as HTMLInputElement;
    passwordInput?.blur();

    // Simulate a small delay for better UX
    setTimeout(() => {
      this.cleanup();
      this.options.onSuccess(password);
    }, 300);
  };

  private togglePasswordVisibility = (): void => {
    if (!this.elements) return;

    const passwordInput = this.elements.modal.querySelector(
      "#password-input",
    ) as HTMLInputElement;
    const eyeClosed = this.elements.modal.querySelector("#eye-closed");
    const eyeOpen = this.elements.modal.querySelector("#eye-open");

    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";

    if (eyeClosed && eyeOpen) {
      eyeClosed.classList.toggle("hidden", isPassword);
      eyeOpen.classList.toggle("hidden", !isPassword);
    }
  };

  private showError(message: string): void {
    if (!this.elements) return;

    const errorDiv = this.elements.modal.querySelector("#error-message");
    const errorText = this.elements.modal.querySelector("#error-text");

    if (errorDiv && errorText) {
      errorText.textContent = message;
      errorDiv.classList.remove("hidden");
    }
  }

  private clearError(): void {
    if (!this.elements) return;

    const errorDiv = this.elements.modal.querySelector("#error-message");
    if (errorDiv) {
      errorDiv.classList.add("hidden");
    }
  }

  private setLoading(loading: boolean): void {
    if (!this.elements) return;

    const submitBtn = this.elements.modal.querySelector(
      "#submit-btn",
    ) as HTMLButtonElement;
    const submitText = this.elements.modal.querySelector("#submit-text");
    const submitSpinner = this.elements.modal.querySelector("#submit-spinner");
    const passwordInput = this.elements.modal.querySelector(
      "#password-input",
    ) as HTMLInputElement;

    if (submitBtn && submitText && submitSpinner && passwordInput) {
      submitBtn.disabled = loading;
      passwordInput.disabled = loading;

      if (loading) {
        submitText.textContent = "Confirming...";
        submitSpinner.classList.remove("hidden");
      } else {
        submitText.textContent = "Confirm";
        submitSpinner.classList.add("hidden");
      }
    }
  }

  private focusInput(): void {
    setTimeout(() => {
      const passwordInput = this.elements?.modal.querySelector(
        "#password-input",
      ) as HTMLInputElement;
      if (passwordInput) {
        passwordInput.focus();
      }
    }, 100);
  }

  private handleCancel(): void {
    this.cleanup();
    this.options.onCancel();
  }

  private cleanup(): void {
    // Remove event listeners
    document.removeEventListener("keydown", this.handleKeydown);

    // Blur active element to dismiss keyboard before removing dialog
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Remove DOM elements
    if (this.elements) {
      this.elements.overlay.close();
      this.elements.overlay.remove();
      this.elements = null;
    }

    // Restore body scroll to its original value (preserves Vaul/Radix scroll lock)
    document.body.style.overflow = this.savedBodyOverflow;

    // Reset Vaul drawer's stale inline styles after keyboard dismisses.
    // Vaul sets style.bottom and style.height on the drawer when any input on the
    // page triggers the virtual keyboard, but doesn't reset them when the focused
    // element is removed from the DOM (the visualViewport resize event doesn't fire).
    // Removing the inline styles restores the CSS class values (bottom-0, h-auto).
    setTimeout(() => {
      const drawer = document.querySelector("[data-vaul-drawer]");
      if (drawer instanceof HTMLElement) {
        drawer.style.removeProperty("bottom");
        drawer.style.removeProperty("height");
      }
    }, 300);
  }
}

export function createPasswordEntryModal(
  txContext?: TransactionContext,
): Promise<string | void> {
  return new Promise((resolve) => {
    const modal = new PinModal({
      onSuccess: (password) => resolve(password),
      onCancel: () => resolve(),
      txContext,
    });

    modal.show();
  });
}
