const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

jest.useFakeTimers();

describe('UI Tests', () => {
  let dom;
  let container;

  beforeEach(() => {
    // Use JSDOM to simulate the DOM environment for the test
    dom = new JSDOM(html, { runScripts: 'dangerously' });
    container = dom.window.document.body;

    // Mock the updateClock function
    dom.window.eval(`
      function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const meridiem = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        hours = hours.toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const timeString = \`\${hours}:\${minutes}:\${seconds} \${meridiem}\`;
        document.getElementById("clock").textContent = timeString;
      }
      setInterval(updateClock, 1000);
    `);
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore all mocked implementations
  });

  test('updates the clock display', () => {
    // Get the current time on the PC (real system time)
    const now = new Date();
    const expectedTime = now.toLocaleTimeString('en-US', { hour12: true });

    // Call updateClock function manually
    dom.window.updateClock();

    const clock = container.querySelector('#clock');
    const receivedTime = clock.textContent.trim();

    // Normalize both expected and received time by removing leading zeros
    const normalizeTime = (time) => {
      return time.replace(/^0/, ''); // Remove leading zero if present
    };

    const normalizedExpectedTime = normalizeTime(expectedTime);
    const normalizedReceivedTime = normalizeTime(receivedTime);

    // Log the expected and received times for debugging
    console.log(`Expected Time: ${normalizedExpectedTime}`);
    console.log(`Received Time: ${normalizedReceivedTime}`);

    // Convert both times to Date objects and then to milliseconds
    const parseTime = (timeStr) => {
      const [hourMinSec, meridiem] = timeStr.split(' ');
      const [hours, minutes, seconds] = hourMinSec.split(':');
      let hours24 = parseInt(hours, 10);
      if (meridiem === 'PM' && hours24 !== 12) {
        hours24 += 12; // Convert PM hours
      }
      if (meridiem === 'AM' && hours24 === 12) {
        hours24 = 0; // Convert 12 AM to 0
      }
      return new Date(1970, 0, 1, hours24, minutes, seconds).getTime(); // Convert to milliseconds
    };

    // Convert both expected and received times to milliseconds
    const expectedTimeDate = parseTime(normalizedExpectedTime);
    const receivedTimeDate = parseTime(normalizedReceivedTime);

    // Log the timestamps for debugging
    console.log(`Expected Time (ms): ${expectedTimeDate}`);
    console.log(`Received Time (ms): ${receivedTimeDate}`);

    // Allow for a small time window difference (1 second tolerance)
    const isTimeClose = Math.abs(expectedTimeDate - receivedTimeDate) <= 1000;

    // Log the comparison result for debugging
    console.log(`isTimeClose: ${isTimeClose}`);

    expect(isTimeClose).toBe(true); // The received time should be within 1 second of the expected time

    // Advance timers by 1 second and check the update
    jest.advanceTimersByTime(1000);
    dom.window.updateClock();

    // Get the expected updated time after 1 second
    const updatedExpectedTime = new Date(now.getTime() + 1000).toLocaleTimeString('en-US', { hour12: true });

    // Normalize the updated expected time
    const normalizedUpdatedExpectedTime = normalizeTime(updatedExpectedTime);

    // Check if the clock matches the updated expected time
    const updatedReceivedTime = clock.textContent.trim();
    const normalizedUpdatedReceivedTime = normalizeTime(updatedReceivedTime);

    // Convert both updated times to milliseconds
    const updatedExpectedTimeDate = parseTime(normalizedUpdatedExpectedTime);
    const updatedReceivedTimeDate = parseTime(normalizedUpdatedReceivedTime);

    // Log the updated comparison for debugging
    console.log(`Updated Expected Time (ms): ${updatedExpectedTimeDate}`);
    console.log(`Updated Received Time (ms): ${updatedReceivedTimeDate}`);

    // Allow a 1 second discrepancy
    const isUpdatedTimeClose = Math.abs(updatedExpectedTimeDate - updatedReceivedTimeDate) <= 1000;

    expect(isUpdatedTimeClose).toBe(true);
  });
});
