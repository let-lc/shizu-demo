import axios, { AxiosError } from 'axios';
import _ from 'lodash';
import { ping } from 'tcp-ping';

import type { HttpPingRecordType, TcpPingRecordType } from '$lib/types';

import { getServerById, readConfigValue, writePingRecord } from './data';

type TcpPingOptions = {
  host: string;
  port: number;
  attempts: number;
};

export const tcpPingAsync = ({ host, port, attempts = 4 }: TcpPingOptions) => {
  let address = host;

  try {
    address = new URL(host).host;
  } catch (err) {
    if ((err as Error)?.message !== 'Invalid URL') {
      console.error(`Not a url: ${address}`);
    }
  }

  return new Promise<TcpPingRecordType>((resolve, reject) => {
    ping({ address, port, attempts }, (err, data) => {
      if (err) {
        reject(err);
      }

      resolve({
        type: 'tcp',
        ranAt: Date.now(),
        time: {
          min: _.round(data.min, 4),
          max: _.round(data.max, 4),
          avg: _.round(data.avg, 4),
        },
        events: data.results.map((result) => {
          return typeof result.err !== 'undefined'
            ? {
                success: false,
                error: {
                  name: result.err.name ?? 'Error',
                  message: result.err.message ?? '',
                },
              }
            : { success: true, time: result.time as number };
        }),
      });
    });
  });
};

const checkValidStatus = (
  statusCode: number,
  validStatusList: string
): boolean => {
  return validStatusList.split(',').some((validStatus) => {
    if (validStatus.includes('-')) {
      const range = validStatus.split('-').map(parseInt);
      return range[0] <= statusCode && statusCode <= range[1];
    } else {
      return parseInt(validStatus) === statusCode;
    }
  });
};

type HttpPingOptions = {
  method: HttpPingRecordType['method'];
  url: string;
  attempts: number;
  expectStatus: string;
};

export const httpPingAsync = async ({
  method = 'GET',
  url,
  attempts = 1,
  expectStatus = '200-299',
}: HttpPingOptions) => {
  const record: HttpPingRecordType = {
    type: 'http',
    ranAt: Date.now(),
    method: method,
    time: { min: Number.MAX_SAFE_INTEGER, max: 0, avg: 0 },
    events: [],
  };

  for (let i = 0; i < attempts; i++) {
    const start = process.hrtime.bigint();
    await axios
      .request({ method, url })
      .then(({ status }) => {
        const time = Number(process.hrtime.bigint() - start) / 1e6;

        if (checkValidStatus(status, expectStatus)) {
          record.events.push({ success: true, status, time });
        } else {
          record.events.push({
            success: false,
            status,
            error: {
              name: 'Invalid Status',
              message: `Status ${status} is not in the accepted status list.`,
            },
          });
        }
      })
      .catch((err: AxiosError) => {
        const time = Number(process.hrtime.bigint() - start) / 1e6;
        const status = err.response?.status as number;

        if (checkValidStatus(status, expectStatus)) {
          record.events.push({ success: true, status, time });
        } else {
          record.events.push({
            success: false,
            status: status ?? null,
            error: {
              name: err.response?.statusText ?? 'Error',
              message: err.message ?? '',
            },
          });
        }
      });
  }

  let sum = 0;
  let success = 0;

  for (const events of record.events) {
    if (events.success) {
      success++;
      sum += events.time;

      if (events.time < record.time.min) {
        record.time.min = events.time;
      }

      if (events.time > record.time.max) {
        record.time.max = events.time;
      }
    }
  }

  // reset min back to 0 if all request failed
  if (success === 0) {
    record.time.min = 0;
  } else {
    record.time.avg = _.round(sum / success, 4);
  }

  return record;
};

const main = async () => {
  const id = process.argv?.[2];

  if (!id) {
    throw new Error('No server id passed in the argument.');
  }

  const server = getServerById(id);

  if (!server) {
    throw new Error(`No server has the id "${id}".`);
  }

  switch (server.serverType) {
    case 'http': {
      const record = await httpPingAsync({
        method: server.method,
        url: readConfigValue(server.url),
        attempts: server.pingAttempts,
        expectStatus: server.statusCodes,
      });
      writePingRecord(server, record);

      break;
    }
    case 'tcp': {
      const record = await tcpPingAsync({
        host: readConfigValue(server.host),
        port: parseInt(readConfigValue(server.port).toString()),
        attempts: server.pingAttempts,
      });
      writePingRecord(server, record);
      break;
    }
    default:
      // @ts-expect-error
      throw new Error(`Server type "${server?.serverType} is not supported."`);
  }
};

main();
