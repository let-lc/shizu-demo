import { getServerList } from '$lib/helpers/data';

import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = async () => {
  return { servers: getServerList() };
};
