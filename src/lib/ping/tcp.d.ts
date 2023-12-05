/**
 * This code is modified from {@link https://github.com/justintaddei/tcp-ping}
 */

/**
 * Ping Options
 */
export interface IPingOptions {
  /**
   * The IP address of the device being pinge$d
   */
  address: string;
  /**
   * The port to ping
   */
  port: number;
  /**
   * The number of times
   * `tcp-probe#ping` will attempt to connect to `address`
   */
  attempts: number;
  /**
   * The time whichafter each TCP socket will timeout
   */
  timeout: number;
}

/**
 * The result of ping attempt that failed
 */
export interface IPingError {
  /**
   * The number of the attempt
   */
  attempt: number;
  /**
   * The error that occured
   */
  error: Error;
}

/**
 * The results of a ping attempt
 */
export interface IPingResult {
  /**
   * The average latency of this ping
   */
  averageLatency: number;
  /**
   * The latency of the fastest attempt
   */
  minimumLatency: number;
  /**
   * The latency of the slowest attempt
   */
  maximumLatency: number;
  /**
   * All the ping attempts
   */
  attempts: IConnectionAttempt[];
  /**
   * All the ping attempts that failed
   */
  errors: IPingError[];
}

/**
 * The result of a connection attempt
 */
export interface IConnectionAttempt {
  /**
   * The number of this attempt
   */
  attemptNumber: number;
  /**
   * The result of the connection
   */
  result:
    | {
        /**
         * The time it took to connect (e.i. the latency of the connection)
         */
        time: number;
      }
    | {
        /**
         * The `Error` that caused the connection to fail
         */
        error: Error;
      };
}

export type connect = (
  options: IPingOptions
) => Promise<IConnectionAttempt['result']>;

export type ping = (option?: Partial<IPingOptions>) => Promise<IPingResult>;
