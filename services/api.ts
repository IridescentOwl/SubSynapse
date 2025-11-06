// This is a mock API service layer. In a real application, this would make
// HTTP requests to your backend. For this demo, it simulates async operations
// and manages data in memory.

import type { User, SubscriptionGroup, MySubscription } from '../types.ts';
import { MOCK_USERS, MOCK_GROUPS, MOCK_MEMBERSHIPS, MOCK_WITHDRAWAL_REQUESTS } from './mock-db.ts';

let users = [...MOCK_USERS];
let groups = [...MOCK_GROUPS];
let memberships = [...MOCK_MEMBERSHIPS];
let withdrawalRequests = [...MOCK_WITHDRAWAL_REQUESTS];

// OTP storage: email -> { otp, expiresAt, type: 'signup' | 'forgotPassword' }
interface OTPData {
    otp: string;
    expiresAt: number;
    type: 'signup' | 'forgotPassword';
    // For signup, store temporary user data
    tempUserData?: { name: string; password: string };
}
const otpStore = new Map<string, OTPData>();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Generate a 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// OTP expires in 10 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000;

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

// Send OTP for signup
export const sendSignupOTP = async (email: string, name: string, password: string): Promise<void> => {
    await delay(500);
    if (users.some(u => u.email === email)) {
        throw new Error('User already exists');
    }
    
    const otp = generateOTP();
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
        type: 'signup',
        tempUserData: { name, password }
    });
    
    // In a real app, this would send an email/SMS with the OTP
    console.log(`[MOCK] Signup OTP for ${email}: ${otp} (expires in 10 minutes)`);
};

// Verify OTP and complete signup
export const verifySignupOTP = async (email: string, otp: string): Promise<{ token: string, user: User }> => {
    await delay(700);
    const otpData = otpStore.get(email);
    
    if (!otpData) {
        throw new Error('OTP not found. Please request a new OTP.');
    }
    
    if (otpData.type !== 'signup') {
        throw new Error('Invalid OTP type.');
    }
    
    if (Date.now() > otpData.expiresAt) {
        otpStore.delete(email);
        throw new Error('OTP has expired. Please request a new OTP.');
    }
    
    // Trim and compare OTP (remove any whitespace)
    if (otpData.otp !== otp.trim()) {
        throw new Error('Invalid OTP. Please try again.');
    }
    
    if (!otpData.tempUserData) {
        throw new Error('User data not found.');
    }
    
    // OTP verified, create user
    const { name, password } = otpData.tempUserData;
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        creditBalance: 1000, // Welcome bonus!
        avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${name}`,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
    users.push(newUser);
    
    // Clean up OTP
    otpStore.delete(email);
    
    const token = createToken(newUser.id);
    setAuthToken(token);
    return { token, user: newUser };
};

// Legacy register function - kept for backward compatibility but now requires OTP flow
export const register = async (name: string, email: string, password: string): Promise<{ token: string, user: User }> => {
    // This should not be called directly anymore - use sendSignupOTP + verifySignupOTP instead
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

// Send OTP for forgot password
export const sendForgotPasswordOTP = async (email: string): Promise<void> => {
    await delay(500);
    const user = users.find(u => u.email === email);
    if (!user) {
        // Don't reveal if user exists for security
        // Still send success message to prevent email enumeration
        return;
    }
    
    const otp = generateOTP();
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
        type: 'forgotPassword'
    });
    
    // In a real app, this would send an email/SMS with the OTP
    console.log(`[MOCK] Forgot Password OTP for ${email}: ${otp} (expires in 10 minutes)`);
};

// Verify OTP for forgot password (without resetting password yet)
export const verifyForgotPasswordOTPOnly = async (email: string, otp: string): Promise<void> => {
    await delay(500);
    const user = users.find(u => u.email === email);
    if (!user) {
        throw new Error('User not found.');
    }
    
    const otpData = otpStore.get(email);
    
    if (!otpData) {
        throw new Error('OTP not found. Please request a new OTP.');
    }
    
    if (otpData.type !== 'forgotPassword') {
        throw new Error('Invalid OTP type.');
    }
    
    if (Date.now() > otpData.expiresAt) {
        otpStore.delete(email);
        throw new Error('OTP has expired. Please request a new OTP.');
    }
    
    // Trim and compare OTP (remove any whitespace)
    if (otpData.otp !== otp.trim()) {
        throw new Error('Invalid OTP. Please try again.');
    }
    
    // OTP is valid, but don't delete it yet - we'll delete it when password is reset
    return;
};

// Verify OTP and reset password
export const verifyForgotPasswordOTP = async (email: string, otp: string, newPassword: string): Promise<void> => {
    await delay(1000);
    const user = users.find(u => u.email === email);
    if (!user) {
        throw new Error('User not found.');
    }
    
    const otpData = otpStore.get(email);
    
    if (!otpData) {
        throw new Error('OTP not found. Please request a new OTP.');
    }
    
    if (otpData.type !== 'forgotPassword') {
        throw new Error('Invalid OTP type.');
    }
    
    if (Date.now() > otpData.expiresAt) {
        otpStore.delete(email);
        throw new Error('OTP has expired. Please request a new OTP.');
    }
    
    // Trim and compare OTP (remove any whitespace)
    if (otpData.otp !== otp.trim()) {
        throw new Error('Invalid OTP. Please try again.');
    }
    
    // OTP verified, update password
    // In a real app, this would hash the password before storing
    console.log(`Password reset for user ${user.id}`);
    
    // Clean up OTP
    otpStore.delete(email);
    
    // In a real app, you would update the hashed password in the database
    // For this mock, we'll just log it
    return;
};

// Legacy forgotPassword function - kept for backward compatibility
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