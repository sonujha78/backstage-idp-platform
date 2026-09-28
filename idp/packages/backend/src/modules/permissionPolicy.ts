import { createBackendModule } from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import {
  AuthorizeResult,
  PolicyDecision,
  isPermission,
} from '@backstage/plugin-permission-common';
import {
  catalogEntityDeletePermission,
  catalogEntityRefreshPermission,
} from '@backstage/plugin-catalog-common/alpha';
import {
  catalogConditions,
  createCatalogConditionalDecision,
} from '@backstage/plugin-catalog-backend/alpha';

class OwnerOnlyPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    // Unregister / refresh sirf entity ki owning team kar sakti hai
    if (
      isPermission(request.permission, catalogEntityDeletePermission) ||
      isPermission(request.permission, catalogEntityRefreshPermission)
    ) {
      return createCatalogConditionalDecision(
        request.permission,
        catalogConditions.isEntityOwner({
          claims: user?.info.ownershipEntityRefs ?? [],
        }),
      );
    }
    return { result: AuthorizeResult.ALLOW };
  }
}

export const permissionPolicyModule = createBackendModule({
  pluginId: 'permission',
  moduleId: 'owner-only-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint },
      async init({ policy }) {
        policy.setPolicy(new OwnerOnlyPolicy());
      },
    });
  },
});

export default permissionPolicyModule;
