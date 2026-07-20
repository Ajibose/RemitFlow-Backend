import http from 'k6/http';
import { check, sleep } from 'k6';

// Read configuration from environment variables or use defaults
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 users
    { duration: '30s', target: 20 }, // Stay at 20 users for 30 seconds
    { duration: '10s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    // 95% of requests must complete below 500ms
    http_req_duration: ['p(95)<500'],
    // Less than 1% of requests can fail
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Batch requests to simulate a user navigating the app
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/health/live`, null, { tags: { name: 'HealthLive' } }],
    ['GET', `${BASE_URL}/api/rates`, null, { tags: { name: 'Rates' } }],
    ['GET', `${BASE_URL}/api/quote?amount=100&from=USD&to=EUR`, null, { tags: { name: 'Quote' } }],
    ['GET', `${BASE_URL}/api/transfers`, null, { tags: { name: 'Transfers' } }],
  ]);

  responses.forEach((res) => {
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  });

  // Post a new transfer
  const payload = JSON.stringify({
    senderName: 'Load Tester',
    recipientName: 'Load Test Recipient',
    amount: 50,
    from: 'USD',
    to: 'EUR',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'CreateTransfer' },
  };

  const createRes = http.post(`${BASE_URL}/api/transfers`, payload, params);
  check(createRes, {
    'create status is 201': (r) => r.status === 201,
  });

  // Small sleep to simulate think time
  sleep(1);
}
