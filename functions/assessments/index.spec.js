/**
 * @fileoverview Unit test for computeScore function used to calculate assessment scores.
 * Verifies score generation logic based on questions and answers provided.
 */

/**
 * Test suite for computeScore function that validates correct SAT score computation.
 */
describe('Test assessment scores calculation', () => {
  /**
   * Test case to ensure computeScore returns the correct SAT score based on mock questions and answers.
   *
   * @returns {void}
   */
  it('Generate accurate results', async () => {
    // Setup mock company ID and assessment type
    const companyId = 'some-very-random-company-id';
    const assessmentType = 'SAT';
    const activeCycle = {id: 'cycle-id'};

    // Define mock company object with tier information
    const company = {
      id: companyId,
      tier: 'TIER_3',
    };

    // Define mock SAT questions of various tiers and categories
    const satQuestions = [
      {
        id: 'some-random-id',
        category_id: 'category-1',
        sort_order: 1,
        tier_id: 'TIER_1',
        value: 'Question details',
      },
      {
        id: 'some-random-id',
        category_id: 'category-1',
        sort_order: 1,
        tier_id: 'TIER_2',
        value: 'Question details',
      },
      {
        id: 'some-random-id',
        category_id: 'category-2',
        sort_order: 1,
        tier_id: 'TIER_2',
        value: 'Question details',
      },
      {
        id: 'some-random-id',
        category_id: 'category-3',
        sort_order: 1,
        tier_id: 'TIER_3',
        value: 'Question details',
      },
      {
        id: 'some-random-id',
        category_id: 'category-3',
        sort_order: 1,
        tier_id: 'TIER_3',
        value: 'Question details',
      },
    ];

    // Define mock SAT answers with points and tiers
    const satAnswers = [
      {
        id: 'some-random-id',
        company_id: companyId,
        catogory_id: 'category-1',
        cycle_id: 'cycle-1',
        points: 5,
        submitted_by: 'anyone',
        value: 'MOSTLY_MET',
        tier: 'TIER_1',
      },
      {
        id: 'some-random-id',
        company_id: companyId,
        catogory_id: 'category-2',
        cycle_id: 'cycle-1',
        points: 7,
        submitted_by: 'anyone',
        value: 'MOSTLY_MET',
        tier: 'TIER_3',
      },
    ];

    // Mock store object with stubbed methods for questions, cycles, answers, and company
    const store = {};
    store.getQuestions = jest.fn().mockImplementationOnce(() => satQuestions);
    store.getActiveSATCycle = jest.fn().mockImplementationOnce(() => activeCycle);
    store.getSatAnswers = jest.fn().mockImplementationOnce(() => satAnswers);
    store.getCompanyById = jest.fn().mockImplementationOnce(() => company);
    store.setAssessmentScore = jest.fn();

    // Mock response object with stubbed json and status methods
    const res = {};
    res.json = jest.fn(() => res);
    res.status = jest.fn(() => res);

    // Execute the computeScore function with the mock store and request
    // await computeScore(store)(req, res);

    // Assert that setAssessmentScore is called with expected parameters
    expect(store.setAssessmentScore).toBeCalledWith(companyId, 'cycle-id', assessmentType, 3);
    expect(res.json).toBeCalledTimes(1);
    expect(res.status).not.toHaveBeenCalledWith(500);
  });
});
