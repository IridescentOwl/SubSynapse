// This is a mock API service layer. In a real application, this would make
// HTTP requests to your backend. For this demo, it simulates async operations
// and manages data in memory.

import type { User, SubscriptionGroup, MySubscription } from '../types';
import { MOCK_USERS, MOCK_GROUPS, MOCK_MEMBERSHIPS, MOCK_WITHDRAWAL_REQUESTS } from './mock-db';

let users = [...MOCK_USERS];
let groups = [...MOCK_GROUPS];
let memberships = [...MOCK_MEMBERSHIPS];
let withdrawalRequests = [...MOCK_WITHDRAWAL_REQUESTS];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getAuthToken = (): string | null => localStorage.getItem('authToken');
const setAuthToken = (token: string | null) => {
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
    }
};

// MOCK JWT: in a real app, this would be a real, signed JWT
const createToken = (userId: string) => `mock-jwt-for-user-${userId}`;
const getUserIdFromToken = (token: string): string | null => {
    const match = token.match(/mock-jwt-for-user-(.*)/);
    return match ? match[1] : null;
};

export const login = async (email: string, password: string): Promise<{ token: string, user: User }> => {
    await delay(500);
    const user = users.find(u => u.email === email);
    // In a real app, you would compare a hashed password
    if (user && password === 'password123') {
        const token = createToken(user.id);
        setAuthToken(token);
        return { token, user };
    }
    throw new Error('Invalid credentials');
};

export const register = async (name: string, email: string, password: string): Promise<{ token: string, user: User }> => {
    await delay(700);
    if (users.some(u => u.email === email)) {
        throw new Error('User already exists');
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        creditBalance: 1000, // Welcome bonus!
        avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${name}`,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
    users.push(newUser);
    const token = createToken(newUser.id);
    setAuthToken(token);
    return { token, user: newUser };
};

export const logout = () => {
    setAuthToken(null);
};

export const fetchAuthenticatedUser = async (): Promise<User | null> => {
    await delay(300);
    const token = getAuthToken();
    if (!token) return null;
    
    const userId = getUserIdFromToken(token);
    if (!userId) return null;

    return users.find(u => u.id === userId) || null;
};

export const fetchGroups = async (): Promise<SubscriptionGroup[]> => {
    await delay(800);
    return groups;
};

export const fetchMySubscriptions = async (): Promise<MySubscription[]> => {
    await delay(400);
    const user = await fetchAuthenticatedUser();
    if (!user) return [];
    
    const myMembershipIds = memberships.filter(m => m.userId === user.id).map(m => m.groupId);
    const myGroupData = groups.filter(g => myMembershipIds.includes(g.id));

    return myGroupData.map(group => {
        const membershipInfo = memberships.find(m => m.groupId === group.id && m.userId === user.id)!;
        return {
            ...group,
            myShare: membershipInfo.myShare,
            membershipType: membershipInfo.membershipType,
            endDate: membershipInfo.endDate,
            nextPaymentDate: membershipInfo.nextPaymentDate,
            credentials: { // Only send credentials to members
                username: group.credentials!.username,
                password: group.credentials!.password,
            }
        };
    });
};

export const joinGroup = async (subscription: MySubscription, cost: number): Promise<void> => {
    await delay(1000);
    const user = await fetchAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");
    if (user.creditBalance < cost) throw new Error("Insufficient funds");

    user.creditBalance -= cost;
    const group = groups.find(g => g.id === subscription.id);
    if (group) {
        group.slotsFilled += 1;
    }
    memberships.push({
        userId: user.id,
        groupId: subscription.id,
        ...subscription
    });
};

export const leaveGroup = async (subscriptionId: string, refund: number): Promise<void> => {
    await delay(600);
    const user = await fetchAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");

    user.creditBalance += refund;
    memberships = memberships.filter(m => !(m.userId === user.id && m.groupId === subscriptionId));
    const group = groups.find(g => g.id === subscriptionId);
    if (group) {
        group.slotsFilled -= 1;
    }
};

export const addCredits = async (amount: number): Promise<void> => {
    await delay(800);
    const user = await fetchAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");
    user.creditBalance += amount;
};

export const createGroup = async (groupData: Omit<SubscriptionGroup, 'id' | 'postedBy' | 'slotsFilled'>): Promise<SubscriptionGroup> => {
    await delay(1200);
    const user = await fetchAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");

    const newGroup: SubscriptionGroup = {
        ...groupData,
        id: `group-${Date.now()}`,
        slotsFilled: 1,
        status: 'pending_review',
        postedBy: {
            name: user.name,
            rating: 5.0 // Initial rating
        },
    };
    groups.unshift(newGroup); // Add to the beginning of the list
    return newGroup;
};

export const requestWithdrawal = async (amount: number, upiId: string): Promise<void> => {
    await delay(1000);
    const user = await fetchAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");
    if (user.creditBalance < amount) throw new Error("Insufficient funds");
    if (amount < 500) throw new Error("Minimum withdrawal amount is 500 credits.");
    
    user.creditBalance -= amount;
    withdrawalRequests.push({
        id: `wd-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        amount,
        upiId,
        status: 'pending',
        date: new Date().toISOString()
    });
};

export const forgotPassword = async (email: string): Promise<void> => {
    await delay(1000);
    console.log(`Password reset link sent to ${email}`);
    // In a real app, this would trigger a backend process to send an email.
    return;
};

export const changePassword = async (oldPass: string, newPass: string): Promise<void> => {
    await delay(1000);
    const user = await fetchAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");
    // This is a mock check. A real backend would compare hashed passwords.
    if (oldPass !== 'password123') {
        throw new Error("Incorrect current password.");
    }
    console.log(`Password for user ${user.id} has been changed.`);
    return;
};

export const updateProfilePicture = async (imageDataUrl: string): Promise<void> => {
    await delay(1200);
    const user = await fetchAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");
    user.avatarUrl = imageDataUrl;
};