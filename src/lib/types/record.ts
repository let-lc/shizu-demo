import { z } from 'zod';

import { httpMethod } from './configuration';

export const PingRecord = z.object({
  /**
   * Ping event ran/started at.
   */
  ranAt: z.number(),
  /**
   * Round-trip time.
   */
  time: z.object({
    /**
     * Minimum round-trip time.
     */
    min: z.number(),
    /**
     * Maximum round-trip time.
     */
    max: z.number(),
    /**
     * Average round-trip time.s
     */
    avg: z.number(),
  }),
});

/**
 * TCP ping record type.
 */
export const TcpPingRecord = z
  .object({
    /**
     * Server Type
     */
    type: z.literal('tcp'),
    /**
     * Ping events.
     */
    events: z.array(
      z.discriminatedUnion('success', [
        z.object({
          /**
           * Ping is successful.
           */
          success: z.literal(true),
          /**
           * Ping round-trip time.
           */
          time: z.number(),
        }),
        z.object({
          /**
           * Ping is successful.
           */
          success: z.literal(false),
          /**
           * Ping error.
           */
          error: z.object({
            /**
             * Error name.
             */
            name: z.string(),
            /**
             * Error message.
             */
            message: z.string(),
          }),
        }),
      ])
    ),
  })
  .merge(PingRecord);

/**
 * HTTP request record type.
 */
export const HttpPingRecord = z
  .object({
    /**
     * Server Type
     */
    type: z.literal('http'),
    /**
     * HTTP request method.
     */
    method: httpMethod,
    /**
     * Request events.
     */
    events: z.array(
      z.discriminatedUnion('success', [
        z.object({
          /**
           * Request is successful.
           */
          success: z.literal(true),
          /**
           * Response status.
           */
          status: z.number(),
          /**
           * Response time.
           */
          time: z.number(),
        }),
        z.object({
          /**
           * Request is successful.
           */
          success: z.literal(false),
          /**
           * Response status.
           */
          status: z.number().nullable(),
          /**
           * Response error.
           */
          error: z.object({
            /**
             * Error name.
             */
            name: z.string(),
            /**
             * Error message.
             */
            message: z.string(),
          }),
        }),
      ])
    ),
  })
  .merge(PingRecord);

export type TcpPingRecordType = z.infer<typeof TcpPingRecord>;
export type HttpPingRecordType = z.infer<typeof HttpPingRecord>;
