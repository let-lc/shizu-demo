import { fail } from '@sveltejs/kit';

import { getServerById, readPingRecord } from '$lib/helpers/data';

import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = async (event) => {
  const server = getServerById(event.params.id);

  if (!server) {
    throw fail(404);
  }

  return {
    server,
    records: readPingRecord(event.params.id),
  };
};
