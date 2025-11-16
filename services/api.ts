// Real API service connecting to backend
import type { User, SubscriptionGroup, MySubscription } from '../types.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

const setAuthTokens = (accessToken: string | null, refreshToken: string | null) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  } else {
    localStorage.removeItem('accessToken');
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

// Helper function to make API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle token refresh if access token expired
  if (response.status === 401 && token) {
    const refreshTokenValue = getRefreshToken();
    if (refreshTokenValue) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
        });

        if (refreshResponse.ok) {
          const { accessToken } = await refreshResponse.json();
          setAuthTokens(accessToken, refreshTokenValue);
          headers['Authorization'] = `Bearer ${accessToken}`;
          
          // Retry original request
          return fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include',
          });
        } else {
          // Refresh failed, logout user
          setAuthTokens(null, null);
          throw new Error('Session expired. Please login again.');
        }
      } catch (error) {
        setAuthTokens(null, null);
        throw error;
      }
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    
    // Handle validation errors from express-validator
    if (error.errors && Array.isArray(error.errors)) {
      const errorMessages = error.errors.map((err: any) => {
        // Handle both old format (err.msg) and new format (err.message)
        return err.message || err.msg || 'Validation error';
      }).join(', ');
      throw new Error(errorMessages || 'Validation failed');
    }
    
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response;
};

// Map backend subscription group to frontend format
const mapGroupToFrontend = (group: any): SubscriptionGroup => {
  // Owner name might be encrypted, but backend should decrypt it in controller
  const ownerName = group.owner?.name || 'Unknown';
  
  return {
    id: group.id,
    name: group.name,
    icon: mapServiceTypeToIcon(group.serviceType),
    totalPrice: group.totalPrice,
    slotsTotal: group.slotsTotal,
    slotsFilled: group.slotsFilled || 0,
    tags: [],
    category: mapServiceTypeToCategory(group.serviceType),
    postedBy: {
      name: ownerName,
      rating: 5.0, // TODO: Get actual rating from reviews endpoint
    },
    status: group.adminApproved ? (group.slotsFilled >= group.slotsTotal ? 'full' : 'active') : 'pending_review',
    proof: group.proofDocument,
  };
};

// Map backend membership to frontend MySubscription format
const mapMembershipToMySubscription = async (membership: any): Promise<MySubscription> => {
  const group = membership.group;
  
  // Fetch credentials if available (only for members)
  let credentials = undefined;
  try {
    const credResponse = await apiRequest(`/credentials/${group.id}`);
    if (credResponse.ok) {
      const credData = await credResponse.json();
      // Credentials are returned as decrypted string, parse if needed
      const creds = typeof credData.credentials === 'string' 
        ? JSON.parse(credData.credentials) 
        : credData.credentials;
      credentials = {
        username: creds.username || '',
        password: creds.password,
      };
    }
  } catch (error) {
    // Credentials not available or access denied
    console.log('Could not fetch credentials:', error);
  }
  
  return {
    ...mapGroupToFrontend(group),
    membershipType: 'monthly',
    myShare: membership.shareAmount,
    nextPaymentDate: membership.endDate ? new Date(membership.endDate).toISOString() : undefined,
    endDate: membership.endDate ? new Date(membership.endDate).toISOString() : undefined,
    credentials,
  };
};

// Helper to map service type to icon
const mapServiceTypeToIcon = (serviceType: string): any => {
  const iconMap: Record<string, any> = {
    'netflix': 'netflix',
    'spotify': 'spotify',
    'youtube': 'youtube',
    'hbo': 'hbo',
    'chatgpt': 'chatgpt',
    'swiggy': 'swiggy',
    'zomato': 'zomato',
    'applemusic': 'applemusic',
    'claude': 'claude',
    'adobe': 'adobe',
    'canva': 'canva',
    'disney': 'disney',
    'office': 'office',
  };
  return iconMap[serviceType.toLowerCase()] || 'placeholder';
};

// Helper to map service type to category
const mapServiceTypeToCategory = (serviceType: string): 'Video' | 'Music' | 'Productivity' | 'Design' => {
  const categoryMap: Record<string, 'Video' | 'Music' | 'Productivity' | 'Design'> = {
    'netflix': 'Video',
    'youtube': 'Video',
    'hbo': 'Video',
    'disney': 'Video',
    'spotify': 'Music',
    'applemusic': 'Music',
    'chatgpt': 'Productivity',
    'claude': 'Productivity',
    'office': 'Productivity',
    'adobe': 'Design',
    'canva': 'Design',
    'swiggy': 'Productivity',
    'zomato': 'Productivity',
  };
  return categoryMap[serviceType.toLowerCase()] || 'Productivity';
};

// Map backend user to frontend format
const mapUserToFrontend = (user: any): User => {
  return {
    id: user.id,
    name: user.name || 'User',
    email: user.email,
    avatarUrl: user.avatar || `https://api.dicebear.com/8.x/adventurer/svg?seed=${user.name || user.email}`,
    memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    creditBalance: user.creditBalance || 0,
  };
};

export const login = async (email: string, password: string): Promise<{ token: string, user: User }> => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  setAuthTokens(data.accessToken, data.refreshToken);

  // Fetch user profile
  const userResponse = await apiRequest('/users/profile');
  const userData = await userResponse.json();
  const user = mapUserToFrontend(userData);

  return { token: data.accessToken, user };
};

export const register = async (name: string, email: string, password: string): Promise<{ message: string }> => {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    
    // Handle validation errors from express-validator
    if (error.errors && Array.isArray(error.errors)) {
      const errorMessages = error.errors.map((err: any) => {
        // Handle both old format (err.msg) and new format (err.message)
        return err.message || err.msg || 'Validation error';
      }).join(', ');
      throw new Error(errorMessages || 'Validation failed');
    }
    
    throw new Error(error.message || 'Registration failed');
  }

  return await response.json();
};

export const verifyOtp = async (email: string, otp: string): Promise<{ token: string, user: User }> => {
  const response = await apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();
  setAuthTokens(data.accessToken, data.refreshToken);

  // Fetch user profile
  const userResponse = await apiRequest('/users/profile');
  const userData = await userResponse.json();
  const user = mapUserToFrontend(userData);

  return { token: data.accessToken, user };
};

export const verifyEmail = async (token: string): Promise<void> => {
  const response = await apiRequest('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Email verification failed');
  }
};

export const fetchCredentials = async (groupId: string): Promise<{ username: string; password?: string }> => {
  const response = await apiRequest(`/credentials/${groupId}`);
  const data = await response.json();
  
  // Credentials are returned as decrypted string, parse if needed
  const creds = typeof data.credentials === 'string' 
    ? JSON.parse(data.credentials) 
    : data.credentials;
    
  return {
    username: creds.username || '',
    password: creds.password,
  };
};

export const logout = () => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    // Call logout endpoint
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {
      // Ignore errors on logout
    });
  }
  setAuthTokens(null, null);
};

export const fetchAuthenticatedUser = async (): Promise<User | null> => {
  try {
    const response = await apiRequest('/users/profile');
    const userData = await response.json();
    return mapUserToFrontend(userData);
  } catch (error) {
    return null;
  }
};

export const fetchGroups = async (): Promise<SubscriptionGroup[]> => {
  const response = await apiRequest('/subscription-groups');
  const groups = await response.json();
  return groups.map(mapGroupToFrontend);
};

export const fetchMySubscriptions = async (): Promise<MySubscription[]> => {
  const response = await apiRequest('/users/my-subscriptions');
  const memberships = await response.json();
  // Map memberships to subscriptions (credentials fetched separately if needed)
  return Promise.all(memberships.map(async (membership: any) => {
    const group = membership.group;
    return {
      ...mapGroupToFrontend(group),
      membershipType: 'monthly' as const,
      myShare: membership.shareAmount,
      nextPaymentDate: membership.endDate ? new Date(membership.endDate).toISOString() : undefined,
      endDate: membership.endDate ? new Date(membership.endDate).toISOString() : undefined,
      // Credentials will be fetched on demand when user clicks to view
      credentials: undefined,
    };
  }));
};

export const joinGroup = async (subscription: MySubscription, cost: number): Promise<void> => {
  await apiRequest(`/subscription-groups/join/${subscription.id}`, {
    method: 'POST',
  });
};

export const leaveGroup = async (subscriptionId: string, refund: number): Promise<void> => {
  await apiRequest(`/subscription-groups/${subscriptionId}/leave`, {
    method: 'DELETE',
  });
};

export const addCredits = async (amount: number): Promise<void> => {
  const response = await apiRequest('/payments/add-credits', {
    method: 'POST',
    body: JSON.stringify({ amount, currency: 'INR' }),
  });

  const order = await response.json();
  
  // In a real implementation, you would redirect to Razorpay payment page
  // For now, we'll just log the order
  console.log('Payment order created:', order);
  
  // TODO: Integrate Razorpay checkout
  throw new Error('Payment integration not yet complete. Please contact support.');
};

export const createGroup = async (groupData: Omit<SubscriptionGroup, 'id' | 'postedBy' | 'slotsFilled'>): Promise<SubscriptionGroup> => {
  const formData = new FormData();
  formData.append('name', groupData.name);
  formData.append('serviceType', groupData.icon); // Using icon as serviceType
  formData.append('totalPrice', groupData.totalPrice.toString());
  formData.append('slotsTotal', groupData.slotsTotal.toString());
  
  // Add credentials as JSON string
  if (groupData.credentials) {
    formData.append('credentials', JSON.stringify(groupData.credentials));
  }
  
  // Handle proof - send URL as a separate field, backend will handle it
  if (groupData.proof) {
    // Send proof URL as a form field (not as file)
    formData.append('proof', groupData.proof);
    // Also try to create a minimal file for the file middleware
    // Create a text file with the URL
    const proofBlob = new Blob([groupData.proof], { type: 'text/plain' });
    const proofFile = new File([proofBlob], 'proof.txt', { type: 'text/plain' });
    formData.append('proofDocument', proofFile);
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated. Please login again.');
  }

  const response = await fetch(`${API_BASE_URL}/subscription-groups`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with boundary for FormData
    },
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create group' }));
    
    // Handle validation errors
    if (error.errors && Array.isArray(error.errors)) {
      const errorMessages = error.errors.map((err: any) => err.message || err.msg || 'Validation error').join(', ');
      throw new Error(errorMessages || 'Validation failed');
    }
    
    throw new Error(error.message || 'Failed to create group');
  }

  const group = await response.json();
  return mapGroupToFrontend(group);
};

export const requestWithdrawal = async (amount: number, upiId: string): Promise<void> => {
  await apiRequest('/payments/withdrawal', {
    method: 'POST',
    body: JSON.stringify({ amount, upiId }),
  });
};

export const forgotPassword = async (email: string): Promise<void> => {
  await apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const changePassword = async (oldPass: string, newPass: string): Promise<void> => {
  // First, we need to get the reset token or use a different endpoint
  // For now, this might need to be implemented differently
  throw new Error('Password change not yet implemented. Please use forgot password.');
};

export const updateProfilePicture = async (imageDataUrl: string): Promise<void> => {
  // Convert data URL to blob
  const response = await fetch(imageDataUrl);
  const blob = await response.blob();
  const formData = new FormData();
  formData.append('avatar', blob, 'avatar.jpg');

  const token = getAuthToken();
  await fetch(`${API_BASE_URL}/users/upload-avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
    credentials: 'include',
  });
};
