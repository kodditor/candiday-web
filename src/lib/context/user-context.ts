
import { create } from 'zustand'
import { type ICurrentOrganization, type ICurrentUser, type MembershipStatus } from '../types/current-user.type';


interface UserStore {
  user: ICurrentUser | null
  organization: ICurrentOrganization | null
  membershipStatus: MembershipStatus | null
  setUser: (values: ICurrentUser | null) => void
  setOrganization: (values: ICurrentOrganization | null) => void
  setMembershipStatus: (status: MembershipStatus | null) => void
  logout: () => void
}

export const useUser = create<UserStore>((set) => ({
  user: null,
  organization: null,
  membershipStatus: null,
  setUser: (values) => set({ user: values }),
  setOrganization: (values) => set({ organization: values }),
  setMembershipStatus: (membershipStatus) => set({ membershipStatus }),
  logout: () => set({ user: null, organization: null, membershipStatus: null })
}))
