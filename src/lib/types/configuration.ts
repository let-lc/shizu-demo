import { z } from 'zod';

import { isCron, isHost, isValidBasePath, isValidStatusList } from '$lib/utils';

/**
 * HTTP method.
 */
export const httpMethod = z.union([
  z.literal('GET'),
  z.literal('HEAD'),
  z.literal('POST'),
  z.literal('PUT'),
  z.literal('DELETE'),
  z.literal('OPTIONS'),
  z.literal('PATCH'),
]);

/**
 * Read value from configuration file or environment variables.
 */
export const ValueFrom = z
  .union([z.literal('config'), z.literal('env')])
  .default('config')
  .describe('Read Value From');

/**
 * HTTP server configurations.
 */
export const ServerHttpConfig = z.object({
  /**
   * Server type.
   */
  serverType: z.literal('http').default('http').describe('HTTP Server'),
  /**
   * HTTP request method
   */
  method: httpMethod.default('GET').describe('HTTP Method'),
  /**
   * HTTP request URL.
   */
  url: z
    .discriminatedUnion('from', [
      z.object({
        from: z.literal<ValueFromType>('config'),
        value: z.string().min(1).url().describe('URL Value'),
      }),
      z.object({
        from: z.literal<ValueFromType>('env'),
        value: z.string().min(1).describe('URL Value'),
      }),
    ])
    .default({
      from: 'config',
      value: '',
    }),
  /**
   * Request payload/body.
   */
  body: z.object({
    from: ValueFrom,
    value: z.string().optional(),
  }),

  /**
   * List of accepted status codes. It can be a number between `100-599` or
   * a range representation like `200-299`.
   */
  statusCodes: z
    .string()
    .min(3)
    .default('200-299')
    .superRefine(isValidStatusList)
    .describe('Accepted Status Code'),
});

/**
 * TCP server configurations.
 */
export const ServerTcpConfig = z.object({
  /**
   * Server type.
   */
  serverType: z.literal('tcp').default('tcp').describe('TCP Server'),
  /**
   * Server host.
   */
  host: z.object({
    from: ValueFrom,
    value: z
      .string()
      .min(1)
      .refine(isHost, 'This is not a valid host.')
      .describe('Server Host'),
  }),
  /**
   * Server port.
   */
  port: z
    .discriminatedUnion('from', [
      z.object({
        from: z.literal<ValueFromType>('config'),
        value: z.number().min(1).max(65535).default(80).describe('Server Port'),
      }),
      z.object({
        from: z.literal<ValueFromType>('env'),
        value: z.string().min(1).describe('Server Port'),
      }),
    ])
    .default({
      from: 'config',
      value: 80,
    }),
});

/**
 * Server config discriminated union type.
 */
export const ServerUnion = z.discriminatedUnion('serverType', [
  ServerHttpConfig,
  ServerTcpConfig,
]);

/**
 * Basic server configuration.
 */
export const ServerConfigBase = z.object({
  /**
   * Server id.
   */
  id: z.string().min(1).describe('Server ID'),
  /**
   * Server name.
   */
  name: z.string().min(1).describe('Server Name'),
  /**
   * Server ping inverval usign cron expression.
   */
  pingCron: z
    .string()
    .refine(isCron, 'Not a valid cron expression.')
    .default('0 0 * * *')
    .describe('Ping Cron Expression'),
  /**
   * Number of attempts to ping the server on each ping event.
   */
  pingAttempts: z.number().default(1).describe('Ping Attempts'),
  /**
   * Keep n seconds of records.
   */
  maxRecordHistory: z
    .number()
    .default(86400)
    .describe('Maximum Record History'),
});

/**
 * Full server configuration type.
 */
export const ServerConfig = z.intersection(ServerConfigBase, ServerUnion);

/**
 * Full configuration type
 */
export const Configuration = z.object({
  /**
   * Cron expression for build workflow
   */
  buildCron: z.string().refine(isCron, 'Not a valid cron expression.'),
  /**
   * Base path for production.
   */
  basePath: z.string().default('').superRefine(isValidBasePath),
  /**
   * Server configuration list.
   */
  servers: z.array(ServerConfig),
});

export type HttpMethodType = z.infer<typeof httpMethod>;
export type ValueFromType = z.infer<typeof ValueFrom>;
export type ServerHttpConfigType = z.infer<typeof ServerHttpConfig>;
export type ServerTcpConfigType = z.infer<typeof ServerTcpConfig>;
export type ServerUnionType = z.infer<typeof ServerUnion>;
export type ServerConfigBaseType = z.infer<typeof ServerConfigBase>;
export type ServerConfigType = z.infer<typeof ServerConfig>;
export type ConfigurationType = z.infer<typeof Configuration>;
