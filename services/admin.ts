// services/admin.ts
import type { User, SubscriptionGroup } from "../types";
import type { Withdrawal } from "./api";
import {
  adminListUsers,
  adminUpdateUser,
  adminDeleteUser,
  fetchGroups,
  adminSetGroupStatus,
  adminListWithdrawals,
  adminSetWithdrawalStatus,
} from "./api";

// USERS
export const listUsers = (): Promise<User[]> => adminListUsers();
export const updateUser = (id: string, patch: Partial<User>) => adminUpdateUser(id, patch);
export const deleteUser = (id: string) => adminDeleteUser(id);

// GROUPS
export const listGroups = (): Promise<SubscriptionGroup[]> => fetchGroups();
export const setGroupStatus = (id: string, status: "active" | "pending_review" | "full") =>
  adminSetGroupStatus(id, status);

// WITHDRAWALS
export const listWithdrawals = (): Promise<Withdrawal[]> => adminListWithdrawals();
export const setWithdrawalStatus = (id: string, status: "approved" | "rejected") =>
  adminSetWithdrawalStatus(id, status);
