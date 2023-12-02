import { fail, redirect } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { SuperValidated } from 'sveltekit-superforms';
import { superValidate, superValidateSync } from 'sveltekit-superforms/server';

import { dev } from '$app/environment';
import { addNewServer } from '$lib/helpers/data';
import {
  type HttpFormSchema,
  httpFormSchema,
  type ServerConfigType,
  type TcpFormSchema,
  tcpFormSchema,
} from '$lib/types';

import type { Actions, PageServerLoad } from './$types';

export const prerender = false;
export const ssr = dev;
export const csr = dev;

export const load: PageServerLoad = (
  e
): { form: SuperValidated<HttpFormSchema | TcpFormSchema> } => {
  switch (e.params.serverType as ServerConfigType['serverType']) {
    case 'http': {
      const form = superValidateSync(httpFormSchema);
      form.data.id = nanoid();
      return { form };
    }
    case 'tcp': {
      const form = superValidateSync(tcpFormSchema);
      form.data.id = nanoid();
      return { form };
    }
    default:
      throw fail(404);
  }
};

export const actions: Actions = {
  http: async (event) => {
    const form = await superValidate(event, httpFormSchema);

    if (!form.valid) {
      return fail(400, { form });
    } else {
      addNewServer(form.data);
      throw redirect(303, `/server/${form.data.id}/edit`);
    }
  },
  tcp: async (event) => {
    const form = await superValidate(event, tcpFormSchema);

    if (!form.valid) {
      return fail(400, { form });
    } else {
      addNewServer(form.data);
      throw redirect(303, `/server/${form.data.id}/edit`);
    }
  },
};
