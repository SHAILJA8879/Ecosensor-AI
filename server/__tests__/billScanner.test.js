const request = require('supertest');
const app = require('../src/app');

// Mock @google/generative-ai library completely
jest.mock('@google/generative-ai', () => {
  const generateContentMock = jest.fn();
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: generateContentMock
      })
    })),
    // Expose mock for assertions
    _generateContentMock: generateContentMock
  };
});

const { _generateContentMock } = require('@google/generative-ai');

describe('BillScanner Component / POST /api/scan-bill API', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'mock-valid-api-key';
    jest.clearAllMocks();
  });

  it('should return 400 Bad Request when no file is uploaded', async () => {
    const res = await request(app)
      .post('/api/scan-bill')
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('No bill image file provided.');
  });

  it('should return 400 Bad Request when the file has an invalid mimetype', async () => {
    const res = await request(app)
      .post('/api/scan-bill')
      .attach('bill', Buffer.from('dummy-txt'), 'bill.txt')
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid file type. Only JPEG, PNG, and WEBP images are accepted.');
  });

  it('should return 400 Bad Request when the file size exceeds the 5MB limit', async () => {
    // Generate a buffer > 5MB (5.1 MB)
    const largeBuffer = Buffer.alloc(5.1 * 1024 * 1024);
    const res = await request(app)
      .post('/api/scan-bill')
      .attach('bill', largeBuffer, 'large_bill.jpg')
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('File size exceeds the 5MB limit.');
  });

  it('should return 200 OK and extracted data when scanning is successful', async () => {
    const mockScanResult = {
      kwh: 250,
      fuel_liters: null,
      billing_date: '2026-06-12'
    };

    _generateContentMock.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(mockScanResult)
      }
    });

    const res = await request(app)
      .post('/api/scan-bill')
      .attach('bill', Buffer.from('fake-image-data'), 'bill.jpg')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockScanResult);
    expect(res.body.message).toContain('Bill successfully scanned and parsed.');
    expect(_generateContentMock).toHaveBeenCalledTimes(1);
  });

  it('should return 500 when Gemini API key configuration is missing', async () => {
    delete process.env.GEMINI_API_KEY;

    const res = await request(app)
      .post('/api/scan-bill')
      .attach('bill', Buffer.from('fake-image-data'), 'bill.jpg')
      .expect(500);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Gemini API key configuration is missing on the server.');
  });

  it('should return 500 when Gemini returns malformed JSON', async () => {
    _generateContentMock.mockResolvedValueOnce({
      response: {
        text: () => 'invalid-json'
      }
    });

    const res = await request(app)
      .post('/api/scan-bill')
      .attach('bill', Buffer.from('fake-image-data'), 'bill.jpg')
      .expect(500);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('The AI model returned an unparsable response.');
  });

  it('should return 429 when Gemini API rate limit is exceeded', async () => {
    _generateContentMock.mockRejectedValueOnce(new Error('429 RESOURCE_EXHAUSTED'));

    const res = await request(app)
      .post('/api/scan-bill')
      .attach('bill', Buffer.from('fake-image-data'), 'bill.jpg')
      .expect(429);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('The AI service is currently overloaded. Please try again in a moment.');
  });
});
