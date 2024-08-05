import { modalStyles } from "./styles";

// Function to create a password input element
export function createPasswordEntryModal() {
  const style = document.createElement("style");
  style.innerHTML = modalStyles();
  document.head.appendChild(style);
  // MODAL HTML
  const modal = `
    <div class="Paper__formContainer" id="PaperModalBody">
      <button class="Paper__closeButton" id="PaperCloseBtn">&times;</button>
      <div class="Paper__formHeader">
        <h1 class='Paper__logoText'>Unlock your Wallet</h1>
        <form class="Paper__formBody" id="PaperForm">
          <label class="Paper__FormLabel">Password</label>
          <input class="Paper__formInput" autocomplete="off" type="password" autofocus id="PaperFormInput" placeholder="Password" />
          <button class="Paper__submitButton" type="submit">
            Authorize
          </button>
        </form>
      </div>
    </div>
  `;
  // ADD FORM TO BODY
  const overlay = document.createElement("dialog");
  overlay.classList.add("Paper__overlay");
  document.body.appendChild(overlay);
  overlay.innerHTML = modal;
  overlay.showModal();
  const formBody = document.getElementById("PaperModalBody");
  setTimeout(() => {
    if (formBody) formBody.style.transform = "translate(-50%, -50%) scale(1)";
  }, 100);

  // FORM SUBMIT HANDLER
  const removeForm = () => {
    if (formBody) formBody.style.transform = "translate(-50%, -50%) scale(0)";
    setTimeout(() => {
      overlay.remove();
    }, 200);
  };

  return new Promise<string | void>((resolve) => {
    document.getElementById("PaperCloseBtn")?.addEventListener("click", () => {
      removeForm();
      resolve();
    });

    // EMAIL FORM SUBMIT HANDLER
    document.getElementById("PaperForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const formInputField = document.getElementById(
        "PaperFormInput"
      ) as HTMLInputElement;
      removeForm();
      const password = formInputField?.value;
      resolve(password);
    });
  });
}
