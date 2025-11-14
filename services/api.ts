import type { User, SubscriptionGroup, MySubscription } from '../types.ts';

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getAuthToken = (): string | null => localStorage.getItem('authToken');
const setAuthToken = (token: string | null) => {
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
    }
};

const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');
const setRefreshToken = (token: string | null) => {
    if (token) {
        localStorage.setItem('refreshToken', token);
    } else {
        localStorage.removeItem('refreshToken');
    }
};

async function apiCall(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}/functions/v1${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

export const login = async (email: string, password: string): Promise<{ token: string, user: User }> => {
    const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    setAuthToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    const user: User = {
        id: data.user.id,
        name: data.user.full_name,
        email: data.user.email,
        creditBalance: data.user.credits || 0,
        avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${data.user.full_name}`,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };

    return { token: data.accessToken, user };
};

export const register = async (name: string, email: string, password: string): Promise<{ token: string, user: User }> => {
    const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ full_name: name, email, password }),
    });

    const user: User = {
        id: data.userId,
        name,
        email,
        creditBalance: 1000,
        avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${name}`,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };

    const loginData = await login(email, password);
    return loginData;
};

export const logout = () => {
    setAuthToken(null);
    setRefreshToken(null);
};

export const fetchAuthenticatedUser = async (): Promise<User | null> => {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const data = await apiCall('/credits/balance', { method: 'GET' });

        const decoded = JSON.parse(atob(token.split('.')[1]));

        return {
            id: decoded.userId,
            name: decoded.full_name || 'User',
            email: decoded.email || '',
            creditBalance: data.balance || 0,
            avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${decoded.userId}`,
            memberSince: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        };
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
};

export const fetchGroups = async (): Promise<SubscriptionGroup[]> => {
    const data = await apiCall('/groups', { method: 'GET' });

    return data.groups.map((group: any) => ({
        id: group.id,
        name: group.name,
        icon: group.icon,
        totalPrice: group.total_price,
        slotsTotal: group.slots_total,
        slotsFilled: group.slots_filled,
        tags: group.tags || [],
        category: group.category,
        status: group.status,
        credentials: null,
        postedBy: {
            name: group.created_by_user?.full_name || 'Unknown',
            rating: 5.0,
        },
    }));
};

export const fetchMySubscriptions = async (): Promise<MySubscription[]> => {
    const data = await apiCall('/groups/my', { method: 'GET' });

    return data.subscriptions.map((membership: any) => {
        const group = membership.group;
        return {
            id: group.id,
            name: group.name,
            icon: group.icon,
            totalPrice: group.total_price,
            slotsTotal: group.slots_total,
            slotsFilled: group.slots_filled,
            tags: group.tags || [],
            category: group.category,
            status: group.status,
            myShare: membership.share_amount,
            membershipType: membership.membership_type,
            endDate: membership.end_date,
            nextPaymentDate: membership.next_payment_date,
            credentials: null,
            postedBy: {
                name: group.created_by_user?.full_name || 'Unknown',
                rating: 5.0,
            },
        };
    });
};

export const joinGroup = async (subscription: MySubscription, cost: number): Promise<void> => {
    await apiCall(`/groups/${subscription.id}/join`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
};

export const leaveGroup = async (subscriptionId: string, refund: number): Promise<void> => {
    await apiCall(`/groups/${subscriptionId}/leave`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
};

export const addCredits = async (amount: number): Promise<void> => {
    await apiCall('/credits/add', {
        method: 'POST',
        body: JSON.stringify({ amount }),
    });
};

export const createGroup = async (groupData: Omit<SubscriptionGroup, 'id' | 'postedBy' | 'slotsFilled'>): Promise<SubscriptionGroup> => {
    const data = await apiCall('/groups', {
        method: 'POST',
        body: JSON.stringify({
            name: groupData.name,
            icon: groupData.icon,
            total_price: groupData.totalPrice,
            slots_total: groupData.slotsTotal,
            category: groupData.category,
            tags: groupData.tags,
            credential_username: groupData.credentials?.username,
            credential_password: groupData.credentials?.password,
        }),
    });

    return {
        id: data.group.id,
        name: data.group.name,
        icon: data.group.icon,
        totalPrice: data.group.total_price,
        slotsTotal: data.group.slots_total,
        slotsFilled: data.group.slots_filled,
        tags: data.group.tags || [],
        category: data.group.category,
        status: data.group.status,
        credentials: groupData.credentials,
        postedBy: {
            name: 'You',
            rating: 5.0,
        },
    };
};

export const requestWithdrawal = async (amount: number, upiId: string): Promise<void> => {
    await apiCall('/credits/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount, upi_id: upiId }),
    });
};

export const forgotPassword = async (email: string): Promise<void> => {
    await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
};

export const changePassword = async (oldPass: string, newPass: string): Promise<void> => {
    await apiCall('/user/change-password', {
        method: 'POST',
        body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
    });
};

export const updateProfilePicture = async (imageDataUrl: string): Promise<void> => {
    await apiCall('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ avatar_url: imageDataUrl }),
    });
};
