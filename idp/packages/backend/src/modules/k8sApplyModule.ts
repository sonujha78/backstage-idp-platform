import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export const k8sApplyModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'k8s-apply-action',
  register(reg) {
    reg.registerInit({
      deps: { scaffolder: scaffolderActionsExtensionPoint },
      async init({ scaffolder }) {
        scaffolder.addActions(
          createTemplateAction({
            id: 'kubernetes:apply',
            description: 'Applies a Kubernetes manifest file to the local cluster using kubectl',
            schema: {
              input: {
                type: 'object',
                required: ['path'],
                properties: {
                  path: {
                    type: 'string',
                    description: 'Path to the manifest file, relative to the workspace',
                  },
                },
              },
            },
            async handler(ctx) {
              const filePath = path.resolve(ctx.workspacePath, ctx.input.path as string);
              ctx.logger.info(`Applying manifest at ${filePath}`);
              const { stdout, stderr } = await execAsync(`kubectl apply -f ${filePath}`);
              if (stdout) ctx.logger.info(stdout);
              if (stderr) ctx.logger.info(stderr);
            },
          }),
        );
      },
    });
  },
});
export default k8sApplyModule;
