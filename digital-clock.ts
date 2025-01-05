function padStart(input: string, length: number, padChar: string): string {
    while (input.length < length) {
      input = padChar + input;
    }
    return input;
  }
  
  function updateClock(): void {
    const now = new Date();
    let hours = now.getHours();
    const meridiem = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hoursString = padStart(hours.toString(), 2, "0");
    const minutes = padStart(now.getMinutes().toString(), 2, "0");
    const seconds = padStart(now.getSeconds().toString(), 2, "0");
    const timeString = `${hoursString}:${minutes}:${seconds} ${meridiem}`;
  
    const clockElement = document.getElementById("clock");
    if (clockElement) {
      clockElement.textContent = timeString;
    }
  }
  
  // Initial call and interval setup
  updateClock();
  setInterval(updateClock, 1000);
  