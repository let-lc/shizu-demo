import { fail } from '@sveltejs/kit';
import { superValidate, superValidateSync } from 'sveltekit-superforms/server';

import { dev } from '$app/environment';
import {
  buildWorkflowExist,
  createBuildWorkflow,
  readConfig,
  removeBuildWorkflow,
  writeConfig,
} from '$lib/helpers/data';
import { configFormSchema } from '$lib/types';

import type { Actions, PageServerLoad } from './$types';

export const prerender = false;
export const ssr = dev;
export const csr = dev;

export const load: PageServerLoad = async () => {
  const config = readConfig();
  const workflow = buildWorkflowExist();
  const form = superValidateSync(
    { buildCron: config.buildCron },
    configFormSchema
  );
  return { form, workflow };
};

export const actions: Actions = {
  update: async (event) => {
    const form = await superValidate(event, configFormSchema);

    if (!form.valid) {
      return fail(400, { form });
    } else {
      const config = readConfig();
      config.buildCron = form.data.buildCron;
      writeConfig(config);
      if (buildWorkflowExist()) {
        createBuildWorkflow();
      }
      return { form };
    }
  },
  workflow: async () => {
    if (buildWorkflowExist()) {
      removeBuildWorkflow();
    } else {
      createBuildWorkflow();
    }
  },
};
