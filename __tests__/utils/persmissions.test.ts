import { describe, it, expect } from 'vitest';

// Import the functions and types
import { getPermissions, hasPermission } from '../../src/utils/permissions'; // Adjust the path accordingly

describe('Permission Tests', () => {
  const superAdmin = { role: 'SUPER_ADMIN' } as const;
  const admin = { role: 'ADMIN' } as const;
  const staff = { role: 'STAFF' } as const;
  const user = { role: 'USER' } as const;
  
  it('should allow SUPER_ADMIN to perform all actions', () => {
    const permissions = getPermissions(superAdmin, false);

    for (const resource in permissions) {
      for (const action in permissions[resource as keyof typeof permissions]) {
        expect(permissions[resource as keyof typeof permissions][action as keyof typeof permissions[keyof typeof permissions]]).toBe(true);
      }
    }
  });

  it('should allow ADMIN to perform certain actions', () => {
    const permissions = getPermissions(admin, false);

    expect(permissions.Vouchers.UPDATE).toBe(true);
    expect(permissions.Vouchers.DELETE).toBe(false); // Only OWNER or SUPER_ADMIN can delete
    expect(permissions.Users.VIEW_PII).toBe(true);
    expect(permissions.Gas.APPROVE).toBe(true);
  });

  it('should allow STAFF to approve gas', () => {
    const permissions = getPermissions(staff, false);

    expect(permissions.Gas.APPROVE).toBe(true);
    expect(permissions.Vouchers.UPDATE).toBe(false);
  });

  it('should not allow USER to perform any restricted actions', () => {
    const permissions = getPermissions(user, false);

    for (const resource in permissions) {
      for (const action in permissions[resource as keyof typeof permissions]) {
        expect(permissions[resource as keyof typeof permissions][action as keyof typeof permissions[keyof typeof permissions]]).toBe(false);
      }
    }
  });

  it('should allow OWNER to delete if isOwner is true', () => {
    const permissions = getPermissions(admin, true); // Here isOwner is true

    expect(permissions.Vouchers.DELETE).toBe(true);
    expect(permissions.Users.DELETE).toBe(true);
  });

  it('should not allow ADMIN to delete if isOwner is false', () => {
    const permissions = getPermissions(admin, false);

    expect(permissions.Vouchers.DELETE).toBe(false);
    expect(permissions.Users.DELETE).toBe(false);
  });

  it('should return false if no user is provided', () => {
    const result = hasPermission(null, false, 'Vouchers', 'DELETE');
    expect(result).toBe(false);
  });

  it('should return false if action is not defined', () => {
    const permissions = getPermissions(admin, false);
    expect(permissions.Users['NON_EXISTENT_ACTION' as keyof typeof permissions.Users]).toBeUndefined();
  });
});
