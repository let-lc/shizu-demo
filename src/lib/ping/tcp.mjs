/**
 * This code is modified from {@link https://github.com/justintaddei/tcp-ping}
 */

import { Socket } from 'net';

/**
 * Attempts to connect to the given host and returns the `IConnectionResult`
 *
 * @type {import("./tcp.d.ts").connect}
 *
 * @param options The `IPingOptions` to use for this connection
 */
function connect({ address, port, timeout }) {
  return new Promise((resolve) => {
    // Create a new tcp scoket
    const socket = new Socket();
    // Save the current time so we can calculate latency
    const startTime = process.hrtime.bigint();

    // Connect to the given host
    socket.connect(port, address, () => {
      // Calculate the latency of the connection
      const timeToConnect = Number(process.hrtime.bigint() - startTime) / 1e6;

      // We don't need the socket anymore
      // so we should destroy it
      socket.destroy();
      // Resolve with the latency of this attempt
      resolve({ time: timeToConnect });
    });

    // Make sure we catch any errors thrown by the socket
    socket.on('error', (error) => {
      // We don't need the socket anymore
      // so we should destroy it
      socket.destroy();
      // Resolve with the error
      resolve({ error });
    });

    // Set the timeout for the connection
    socket.setTimeout(timeout, () => {
      // We don't need the socket anymore
      // so we should destroy it
      socket.destroy();
      // Resolve with a timeout error
      resolve({ error: Error('Request timeout') });
    });
  });
}

/**
 * Pings the given device and report the statistics
 * in the form of an `IPingResult` object
 *
 * @type {import("./tcp.d.ts").ping}
 *
 * @param options The `IPingOptions` object
 */
export async function ping(options = {}) {
  /**
   * Default ping options
   * @type {import("./tcp.d.ts").IPingOptions}
   */
  const opts = {
    address: '127.0.0.1',
    attempts: 10,
    port: 80,
    timeout: 3000,
    // Otherwrite default options
    ...options,
  };

  if (opts.port < 1) throw RangeError('Negative port');

  /**
   * An array of all the connection attempts
   *
   * @type {import("./tcp.d.ts").IConnectionAttempt[]}
   */
  const connectionResults = [];

  // Try to connect to the given host
  for (let i = 0; i < opts.attempts; i++) {
    connectionResults.push({
      // i + 1 so the first attempt is `attempt 1`
      // instead of `attempt 0`
      attemptNumber: i + 1,
      result: await connect(opts),
    });
  }
  /**
   * The result of this ping
   *
   * @type {import("./tcp.d.ts").IPingResult}
   */
  const result = {
    minimumLatency: Infinity,
    maximumLatency: 0,
    averageLatency: NaN,
    attempts: connectionResults,
    errors: [],
  };

  /**
   * The sum of the latency of all
   * the successful ping attempts
   */
  let latencySum = 0;

  // Loop over all the connection results
  for (const attempt of connectionResults) {
    // If `time` is undefined then
    // assume there's an error
    if (typeof attempt.result.time === 'undefined') {
      // Push the error onto the errors array
      result.errors.push({
        attempt: attempt.attemptNumber,
        // If error is undefined then throw an unknown error
        error: attempt.result.error || Error('Unknown error'),
      });
      // We're done with this iteration
      continue;
    }

    // Get the latency of this attempt
    const { time } = attempt.result;

    // Add it to the sum
    latencySum += time;

    // If this attempts latency is less
    // then the current `minimumLatency` then we
    // update `minimumLatency`
    if (time < result.minimumLatency) result.minimumLatency = time;

    // If this attempts latency is greater
    // then the current `maximumLatency` then we
    // update `maximumLatency`
    if (time > result.maximumLatency) result.maximumLatency = time;
  }

  // Calculate the average latency of all the attempts
  // (excluding the attempts that errored because those
  // didn't return a latency)
  result.averageLatency =
    latencySum / (connectionResults.length - result.errors.length);

  // Finally, resolve with the result
  return result;
}
