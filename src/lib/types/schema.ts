import type { z } from 'zod';

import {
  Configuration,
  ServerConfigBase,
  ServerHttpConfig,
  ServerTcpConfig,
} from './configuration';

export const httpFormSchema = ServerConfigBase.merge(ServerHttpConfig);
export const tcpFormSchema = ServerConfigBase.merge(ServerTcpConfig);
export const configFormSchema = Configuration.omit({ servers: true });

export type HttpFormSchema = typeof httpFormSchema;
export type TcpFormSchema = typeof tcpFormSchema;
export type ConfigFormSchema = typeof configFormSchema;

export type HttpFormData = z.infer<HttpFormSchema>;
export type TcpFormData = z.infer<TcpFormSchema>;
export type ConfigFormData = z.infer<ConfigFormSchema>;
