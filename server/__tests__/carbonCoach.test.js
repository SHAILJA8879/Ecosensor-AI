const request = require('supertest');
const app = require('../src/app');

// Mock @google/generative-ai library
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

describe('AI Carbon Coach API Endpoint (POST /api/carbon-coach)', () => {
  
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'mock-valid-api-key';
    jest.clearAllMocks();
  });

  // 1. Validation: Carbon Score bounds
  test('should return 400 Bad Request if carbonScore is out of bounds', async () => {
    const res = await request(app)
      .post('/api/carbon-coach')
      .send({
        carbonScore: 105, // invalid (>100)
        transport: 100,
        food: 'veg',
        electricity: 200
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Carbon score must be an integer between 0 and 100');
  });

  // 2. Validation: Negative metrics
  test('should return 400 Bad Request if transport or electricity are negative', async () => {
    const res = await request(app)
      .post('/api/carbon-coach')
      .send({
        carbonScore: 75,
        transport: -5, // invalid
        food: 'veg',
        electricity: 200
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Transport distance must be a non-negative number');
  });

  // 3. Validation: Invalid food habit
  test('should return 400 Bad Request if food habit is invalid', async () => {
    const res = await request(app)
      .post('/api/carbon-coach')
      .send({
        carbonScore: 75,
        transport: 100,
        food: 'organic', // invalid
        electricity: 200
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Food habit must be 'veg', 'mixed', or 'non-veg'");
  });

  // 4. Validation: Invalid history array
  test('should return 400 Bad Request if history contains invalid scores', async () => {
    const res = await request(app)
      .post('/api/carbon-coach')
      .send({
        carbonScore: 75,
        transport: 100,
        food: 'mixed',
        electricity: 200,
        history: [80, -10] // invalid score in history
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('History items must be scores between 0 and 100');
  });

  // 5. Successful response mapping
  test('should return 200 OK and valid coach data structure on valid request payload', async () => {
    const mockCoachData = {
      analysis: 'You have a solid eco score, but transport is your highest area.',
      topEmissionSource: 'transport',
      topEmissionSourceExplanation: 'Your transport distance of 300 km/week produces 259.8 kg CO2.',
      recommendations: [
        { title: 'Carpool', description: 'Share rides to work.', estimatedCO2Saved: 30 },
        { title: 'Drive less', description: 'Walk or bike.', estimatedCO2Saved: 20 },
        { title: 'Efficient driving', description: 'Keep tires inflated.', estimatedCO2Saved: 10 },
        { title: 'Public transit', description: 'Use bus or rail.', estimatedCO2Saved: 50 },
        { title: 'Electric vehicle', description: 'Consider EV swap.', estimatedCO2Saved: 80 }
      ],
      sevenDayChallenge: {
        title: 'Transit Transition',
        days: [
          { day: 1, task: 'Take the bus today' },
          { day: 2, task: 'Car share with peers' },
          { day: 3, task: 'Cycle to close shops' },
          { day: 4, task: 'Walk in the evening' },
          { day: 5, task: 'WFH to skip transit' },
          { day: 6, task: 'Plan a transit route' },
          { day: 7, task: 'Use zero-emission travel' }
        ]
      },
      predictedImprovement: {
        newScore: 88,
        co2ReductionPercent: 25,
        explanation: 'Committing to these transit goals will boost your score.'
      }
    };

    // Mock generative AI success text
    _generateContentMock.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify(mockCoachData)
      }
    });

    const res = await request(app)
      .post('/api/carbon-coach')
      .send({
        carbonScore: 70,
        transport: 300,
        food: 'mixed',
        electricity: 150
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.analysis).toBe(mockCoachData.analysis);
    expect(res.body.data.topEmissionSource).toBe('transport');
    expect(res.body.data.recommendations).toHaveLength(5);
    expect(res.body.data.sevenDayChallenge.days).toHaveLength(7);
    expect(res.body.data.predictedImprovement.newScore).toBe(88);
  });

  // 6. Retry on malformed JSON
  test('should retry Gemini API request once if first response contains invalid JSON', async () => {
    const mockCoachData = {
      analysis: 'Personal analysis content.',
      topEmissionSource: 'electricity',
      topEmissionSourceExplanation: 'Grid power causes most of your footprint.',
      recommendations: [
        { title: 'LED lights', description: 'Swap bulbs.', estimatedCO2Saved: 5 },
        { title: 'Unplug standbys', description: 'Kill vampires.', estimatedCO2Saved: 4 },
        { title: 'Cold wash', description: 'Wash laundry cold.', estimatedCO2Saved: 8 },
        { title: 'Thermostat drop', description: 'Reduce heating.', estimatedCO2Saved: 12 },
        { title: 'Solar setup', description: 'Invest in solar.', estimatedCO2Saved: 50 }
      ],
      sevenDayChallenge: {
        title: 'Electricity Savings',
        days: [
          { day: 1, task: 'Unplug items' },
          { day: 2, task: 'LED bulb swap' },
          { day: 3, task: 'Cold wash laundry' },
          { day: 4, task: 'Air dry clothes' },
          { day: 5, task: 'No screen evening' },
          { day: 6, task: 'Check seals on fridge' },
          { day: 7, task: 'Optimize thermostat' }
        ]
      },
      predictedImprovement: {
        newScore: 78,
        co2ReductionPercent: 12,
        explanation: 'Saving power makes an immediate impact.'
      }
    };

    // First response malformed, second response valid JSON
    _generateContentMock
      .mockResolvedValueOnce({
        response: {
          text: () => 'Malformed non-JSON content'
        }
      })
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockCoachData)
        }
      });

    const res = await request(app)
      .post('/api/carbon-coach')
      .send({
        carbonScore: 65,
        transport: 100,
        food: 'veg',
        electricity: 400
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.topEmissionSource).toBe('electricity');
    expect(_generateContentMock).toHaveBeenCalledTimes(2); // Retried once!
  });

  // 7. Error: Double failure falls back to 500
  test('should return 500 Internal Server Error if Gemini fails twice', async () => {
    // Fail both calls
    _generateContentMock.mockRejectedValue(new Error('Gemini API crash'));

    const res = await request(app)
      .post('/api/carbon-coach')
      .send({
        carbonScore: 65,
        transport: 100,
        food: 'veg',
        electricity: 400
      })
      .expect(500);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Failed to generate coaching insights');
  });
});
