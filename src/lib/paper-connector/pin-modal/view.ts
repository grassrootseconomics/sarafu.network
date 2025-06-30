interface PinModalOptions {
  onSuccess: (password: string) => void;
  onCancel: () => void;
}

interface PinModalElements {
  overlay: HTMLDialogElement;
  modal: HTMLDivElement;
  cleanup: () => void;
}

class PinModal {
  private elements: PinModalElements | null = null;
  private options: PinModalOptions;

  constructor(options: PinModalOptions) {
    this.options = options;
  }

  public show(): void {
    this.createModal();
  }

  private createModal(): void {
    // Create dialog overlay
    const overlay = document.createElement("dialog");
    overlay.className =
      "fixed inset-0 z-[9999999999] bg-black/50 backdrop-blur-sm";

    // Create modal content
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-[9999999999] flex items-center justify-center p-3 sm:p-4 md:p-6";
    modal.innerHTML = this.getModalHTML();

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Show modal
    overlay.showModal();

    this.elements = {
      overlay,
      modal,
      cleanup: () => this.cleanup(),
    };

    this.attachEventListeners();
    this.focusInput();
  }

  private getModalHTML(): string {
    return `
      <div class="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-sm sm:max-w-md mx-auto animate-in fade-in-50 zoom-in-95 duration-200">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 sm:p-6 border-b bg-gray-50/50">
          <div class="flex items-center gap-3 sm:gap-4 pr-4">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-base sm:text-lg font-semibold text-gray-900 truncate">Unlock Wallet</h2>
              <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Enter your wallet password</p>
            </div>
          </div>
          <button 
            id="close-btn" 
            class="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
            aria-label="Close"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <form id="password-form" class="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div class="space-y-2 sm:space-y-3">
            <label for="password-input" class="block text-sm sm:text-base font-medium text-gray-700">
              Password
            </label>
            <div class="relative">
              <input
                type="password"
                id="password-input"
                class="w-full px-3 sm:px-4 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                id="toggle-password"
                class="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] justify-center"
              >
                <svg id="eye-closed" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg id="eye-open" class="w-5 h-5 sm:w-6 sm:h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div id="error-message" class="hidden text-sm sm:text-base text-red-600 bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span id="error-text" class="text-sm sm:text-base">An error occurred</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 sm:gap-3 pt-2 sm:pt-4">
            <button
              type="button"
              id="cancel-btn"
              class="flex-1 px-4 py-3 sm:py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm sm:text-base min-h-[44px] order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-btn"
              class="flex-1 px-4 py-3 sm:py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base min-h-[44px] flex items-center justify-center order-1 sm:order-2"
            >
              <span id="submit-text">Unlock</span>
              <svg id="submit-spinner" class="hidden w-4 h-4 sm:w-5 sm:h-5 ml-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </div>
        </form>
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
      "#password-input"
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

    // Simulate a small delay for better UX
    setTimeout(() => {
      this.cleanup();
      this.options.onSuccess(password);
    }, 300);
  };

  private togglePasswordVisibility = (): void => {
    if (!this.elements) return;

    const passwordInput = this.elements.modal.querySelector(
      "#password-input"
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
      "#submit-btn"
    ) as HTMLButtonElement;
    const submitText = this.elements.modal.querySelector("#submit-text");
    const submitSpinner = this.elements.modal.querySelector("#submit-spinner");
    const passwordInput = this.elements.modal.querySelector(
      "#password-input"
    ) as HTMLInputElement;

    if (submitBtn && submitText && submitSpinner && passwordInput) {
      submitBtn.disabled = loading;
      passwordInput.disabled = loading;

      if (loading) {
        submitText.textContent = "Unlocking...";
        submitSpinner.classList.remove("hidden");
      } else {
        submitText.textContent = "Unlock";
        submitSpinner.classList.add("hidden");
      }
    }
  }

  private focusInput(): void {
    setTimeout(() => {
      const passwordInput = this.elements?.modal.querySelector(
        "#password-input"
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

    // Remove DOM elements
    if (this.elements) {
      this.elements.overlay.close();
      this.elements.overlay.remove();
      this.elements = null;
    }

    // Restore body scroll
    document.body.style.overflow = "";
  }
}

export function createPasswordEntryModal(): Promise<string | void> {
  return new Promise((resolve) => {
    const modal = new PinModal({
      onSuccess: (password) => resolve(password),
      onCancel: () => resolve(),
    });

    modal.show();
  });
}
