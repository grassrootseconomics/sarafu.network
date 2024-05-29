export const modalStyles = () => `
  .Paper__overlay::backdrop {
      background-color: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(6px);
      pointer-events: none;
      z-index: 2147483648;
    }

  .Paper__formContainer {
    display: flex;
    flex-direction: column;
    font-family: var(--font-family-sans), sans-serif;
    text-align: center;
    gap: 30px;
    align-items: center;
    justify-content: start;
    position: fixed;
    overflow: hidden;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    transition: all 0.2s ease-in-out;
    width: min(400px, 90%);
    z-index: 9999;
    box-shadow: 0 12px 56px rgb(119 118 122 / 15%);
    border-radius: 30px;
    padding: 60px 20px;
    background-color: #fff;
  }
  .Paper__closeButton {
    position: absolute;
    top: 0;
    right: 15px;
    padding: 10px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-size: 30px;
    color: #ccc;
    z-index: 9999;
    pointer-events: auto;

  }
  .Paper__formHeader{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 100%;
  }
  .Paper__logoText{
    font-size: 22px;
    font-weight: bold;
    color: #333;
  }
  .Paper__formBody{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 100%;
  }
  .Paper__formLabel{
    font-size: 17px;
    font-weight: 500;
  }
  .Paper__formInput {
    padding: 10px;
    width: 100%;
    height: 45px;
    max-width: 300px;
    pointer-events: auto;

    text-align: center;
    margin-bottom: 10px;
    border-width: 1px;
    border-style: solid;
    border-color: #D6D6D6;
    color: #333;
    font-size: 17px;
    font-weight: 400;
    border-radius: 10px;
    accent-color: hsl(var(--primary));
    background-color: transparent;
  }
  .Paper__formInput::placeholder { 
    color: #D6D6D6;
    opacity: 1; 
  }
  .Paper__submitButton {
    display: block;
    width: 100%;
    height: 2.5rem;
    max-width: 300px;
    border: none;
    pointer-events: auto;
    border-radius: calc(var(--radius) - 2px);
    cursor: pointer;
    color: white;
    margin-bottom: 10px;
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    background-color: hsl(var(--primary));
  }
  .Paper__submitButton:hover {
    background-color: hsl(var(--primary) / 0.8);
  }

`;
