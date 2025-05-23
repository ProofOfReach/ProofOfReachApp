import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handler from '../../../../../pages/api/ads/[id]/view';

// We're using a simple in-memory implementation now, no need to mock DB or auth
describe('Ad View API (Demo Mode)', () => {
  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res._getJSONData()).toEqual({ error: 'Method not allowed' });
  });

  it('records a view and returns log', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      query: { id: 'ad-123' },
      headers: {
        'user-agent': 'test-browser'
      }
    });

    await handler(req, res);

    // Should return log
    expect(res.statusCode).toBe(200);
    
    // Get the actual response
    const jsonData = res._getJSONData();
    
    // In demo mode, all views are allowed
    expect(jsonData).toMatchObject({
      adId: 'ad-123',
      allowed: true,
      periodHours: 1
    });
    
    // Should have some remaining views and at least 1 total view
    expect(jsonData.viewsRemaining).toBeGreaterThanOrEqual(1);
    expect(jsonData.totalViews).toBeGreaterThanOrEqual(1);
  });

  it('tracks multiple views from the same viewer', async () => {
    const userAgent = 'repeat-viewer-' + Date.now();
    
    // First view
    const { req: req1, res: res1 } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      query: { id: 'ad-test' },
      headers: {
        'user-agent': userAgent
      }
    });

    await handler(req1, res1);
    const firstResponse = res1._getJSONData();
    
    // Second view from same viewer
    const { req: req2, res: res2 } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      query: { id: 'ad-test' },
      headers: {
        'user-agent': userAgent
      }
    });

    await handler(req2, res2);
    const secondResponse = res2._getJSONData();
    
    // In demo mode we still allow the view, but track it was seen before
    expect(secondResponse.allowed).toBe(true);
    
    // We adjust viewsRemaining for repeat viewers
    expect(secondResponse.viewsRemaining).toBe(firstResponse.viewsRemaining - 1);
  });
});