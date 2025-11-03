import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 10 },
    { duration: '20s', target: 0 },
  ],
};

const API_BASE_URL = 'http://localhost:4000/api';

const login = (email, password) => {
  const res = http.post(`${API_BASE_URL}/auth/login`, JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json('accessToken');
};

export default function () {
  // Test the getGroups endpoint
  const getGroupsRes = http.get(`${API_BASE_URL}/subscription-groups`);
  check(getGroupsRes, { 'getGroups: status was 200': (r) => r.status === 200 });

  sleep(1);

  // Test the joinGroup endpoint (requires a valid group ID and authenticated user)
  // In a real test, you would fetch a valid group ID from the getGroups response
  // and use a pre-registered user's credentials.
  /*
  const authToken = login('testuser@example.com', 'password123');
  const groupId = 'some-valid-group-id';

  const joinGroupRes = http.post(
    `${API_BASE_URL}/subscription-groups/join/${groupId}`,
    null,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  check(joinGroupRes, { 'joinGroup: status was 200': (r) => r.status === 200 });
  */
}
