import { AccountRoleType } from "~/server/enums";
type Role = "SUPER_ADMIN" | "ADMIN" | "OWNER" | "STAFF" | "USER";

interface User {
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "USER";
}

export const permissions = {
  Vouchers: {
    UPDATE: ["SUPER_ADMIN", "ADMIN", "OWNER"],
    DELETE: ["SUPER_ADMIN", "OWNER"],
    ADD: ["SUPER_ADMIN", "ADMIN"],
  },
  Pools: {
    UPDATE: ["SUPER_ADMIN", "ADMIN", "OWNER"],
    DELETE: ["SUPER_ADMIN", "OWNER"],
  },
  Users: {
    UPDATE: ["SUPER_ADMIN", "ADMIN", "OWNER"],
    DELETE: ["SUPER_ADMIN", "OWNER"],
    UPDATE_ROLE: ["SUPER_ADMIN"],
    VIEW_PII: ["SUPER_ADMIN", "ADMIN", "OWNER"],
  },
  Products: {
    DELETE: ["SUPER_ADMIN", "OWNER"],
    UPDATE: ["SUPER_ADMIN", "ADMIN", "STAFF", "OWNER"],
  },
  Reports: {
    CREATE: ["SUPER_ADMIN", "ADMIN", "OWNER", "STAFF", "USER"],
    UPDATE: ["SUPER_ADMIN", "ADMIN", "OWNER", "STAFF"],
    DELETE: ["SUPER_ADMIN", "OWNER"],
    APPROVE: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    REJECT: ["SUPER_ADMIN", "ADMIN", "STAFF"],
    SUBMIT: ["OWNER"],
    VIEW: ["SUPER_ADMIN", "ADMIN", "OWNER", "STAFF"],
  },
  Tags: {
    CREATE: ["SUPER_ADMIN"],
  },
  Gas: {
    APPROVE: ["SUPER_ADMIN", "ADMIN", "STAFF"],
  },
  Contract: {
    UPDATE: ["OWNER"],
  },
} as const;

export type Permissions = typeof permissions;

export function getPermissions(
  user: User | null,
  isOwner: boolean
): {
  [K in keyof Permissions]: {
    [A in keyof Permissions[K]]: boolean;
  };
} {
  const resources = Object.keys(permissions) as (keyof typeof permissions)[];

  const userPermissions = resources.reduce(
    (acc, resource) => {
      const actions = Object.keys(
        permissions[resource]
      ) as (keyof (typeof permissions)[typeof resource])[];

      const resourcePermissions = actions.reduce((resourceAcc, action) => {
        return {
          ...resourceAcc,
          [action]: hasPermission(user, isOwner, resource, action),
        };
      }, {} as Record<keyof (typeof permissions)[typeof resource], boolean>);

      return {
        ...acc,
        [resource]: resourcePermissions,
      };
    },
    {} as {
      [K in keyof Permissions]: {
        [A in keyof Permissions[K]]: boolean;
      };
    }
  );

  return userPermissions;
}

export function hasPermission<T extends keyof typeof permissions>(
  user: User | null | undefined,
  isOwner: boolean,
  resource: T,
  action: keyof (typeof permissions)[T]
): boolean {
  // Return false if no user is provided
  if (!user) return false;

  // Retrieve the allowed roles for the given resource and action
  const allowedRoles = permissions[resource]?.[action] as Role[] | undefined;

  // If no roles are defined for the action, return false
  if (!allowedRoles) return false;

  // Check if the user's role or the owner status allows the action
  return (
    allowedRoles.includes(user.role) ||
    (isOwner && allowedRoles.includes("OWNER"))
  );
}

export const isAdmin = (user?: User) => {
  return user?.role === AccountRoleType.ADMIN;
};
export const isStaff = (user?: User) => {
  return user?.role === AccountRoleType.STAFF;
};

export const isSuperAdmin = (user?: User) => {
  return user?.role === AccountRoleType.SUPER_ADMIN;
};
