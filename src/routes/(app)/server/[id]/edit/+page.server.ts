import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';

import { dev } from '$app/environment';
import {
  createServerWorkflow,
  deleteServerById,
  getServerById,
  removeServerWorkflow,
  serverWorkflowExist,
  updateServer,
} from '$lib/helpers/data';
import { httpFormSchema, tcpFormSchema } from '$lib/types';

import type { Actions, PageServerLoad } from './$types';

export const prerender = false;
export const ssr = dev;
export const csr = dev;

export const load: PageServerLoad = async (event) => {
  const server = getServerById(event.params?.id);
  const workflow = serverWorkflowExist(event.params?.id);

  if (server) {
    return { server, workflow };
  } else {
    throw fail(400);
  }
};

export const actions: Actions = {
  httpUpdate: async (event) => {
    const form = await superValidate(event, httpFormSchema);

    if (!form.valid) {
      return fail(400, { form });
    } else {
      updateServer(form.data);
      if (serverWorkflowExist(form.data.id)) {
        createServerWorkflow(form.data.id);
      }
      return { form };
    }
  },
  tcpUpdate: async (event) => {
    const form = await superValidate(event, tcpFormSchema);

    if (!form.valid) {
      console.log(form.errors);

      return fail(400, { form });
    } else {
      updateServer(form.data);
      if (serverWorkflowExist(form.data.id)) {
        createServerWorkflow(form.data.id);
      }
      return { form };
    }
  },
  delete: async (event) => {
    deleteServerById(event.params.id);
    if (serverWorkflowExist(event.params?.id)) {
      removeServerWorkflow(event.params.id);
    }
    throw redirect(303, '/');
  },
  workflow: async (event) => {
    if (serverWorkflowExist(event.params?.id)) {
      removeServerWorkflow(event.params.id);
    } else {
      createServerWorkflow(event.params.id);
    }
  },
};
