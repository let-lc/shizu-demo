import type {
  ConfigurationType,
  HttpPingRecordType,
  ServerConfigType,
  TcpPingRecordType,
  ValueFromType,
} from '$lib/types';

export type round = (num: number, precision: number) => number;

export type TcpPingOptions = {
  host: string;
  port: number;
  attempts: number;
};

export type tcpPingAsync = (
  options: TcpPingOptions
) => Promise<TcpPingRecordType>;

export type checkValidStatus = (
  statusCode: number,
  validStatusList: string
) => boolean;

export type HttpPingOptions = {
  method: HttpPingRecordType['method'];
  url: string;
  attempts: number;
  expectStatus: string;
};

export type httpPingAsync = (
  options: HttpPingOptions
) => Promise<HttpPingRecordType>;

export type readConfig = () => ConfigurationType;

export type readConfigValue = <T>(config: {
  from: ValueFromType;
  value: T;
}) => T;

export type writePingRecord = (
  server: ServerConfigType,
  record: HttpPingRecordType | TcpPingRecordType
) => void;
