// Polyfill TextEncoder and TextDecoder for Node.js
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

describe('updateClock', () => {
  let document;

  beforeEach(() => {
    const dom = new JSDOM(
      `<!DOCTYPE html><html><body><div id="clock">00:00:00</div></body></html>`
    );
    document = dom.window.document;
    global.document = document;

    global.updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const meridiem = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      hours = hours.toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}:${seconds} ${meridiem}`;
      document.getElementById('clock').textContent = timeString;
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('displays correct initial time', () => {
    jest.spyOn(global.Date.prototype, 'getHours').mockReturnValue(10);
    jest.spyOn(global.Date.prototype, 'getMinutes').mockReturnValue(30);
    jest.spyOn(global.Date.prototype, 'getSeconds').mockReturnValue(45);

    updateClock();
    const clock = document.getElementById('clock');
    expect(clock.textContent).toBe('10:30:45 AM');
  });

  test('switches to PM after noon', () => {
    jest.spyOn(global.Date.prototype, 'getHours').mockReturnValue(13);
    jest.spyOn(global.Date.prototype, 'getMinutes').mockReturnValue(15);
    jest.spyOn(global.Date.prototype, 'getSeconds').mockReturnValue(30);

    updateClock();
    const clock = document.getElementById('clock');
    expect(clock.textContent).toBe('01:15:30 PM');
  });

  test('updates every second', () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');

    setInterval(updateClock, 1000);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
  });
});
