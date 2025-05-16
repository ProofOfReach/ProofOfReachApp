import { UserRoleType } from '../../types/role';

const useAuthRefactoredMock = jest.fn().mockReturnValue({
  authState: {
    roles: ['user', 'advertiser'] as UserRoleType[],
    isAuthenticated: true,
  },
  refreshRoles: jest.fn(),
  hasRole: jest.fn().mockReturnValue(true),
  assignRole: jest.fn().mockResolvedValue(true),
  removeRole: jest.fn().mockResolvedValue(true),
  login: jest.fn().mockResolvedValue(true),
  logout: jest.fn().mockResolvedValue(undefined),
});

export { useAuthRefactoredMock };