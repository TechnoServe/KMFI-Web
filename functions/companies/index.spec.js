const {submitSATAnswer} = require('./index');
const guards = require('../guards');

describe('Test self Assessment Endpoints', () => {
  it('submitSATAnswer', async () => {
    const companyId = 'some-very-random-company-id';
    const categoryId = 'some-very-random-category-id';
    const cycleId = 'some-very-random-cycle-id';
    const userId = 'some-very-random-user-id';

    // Mock request
    const req = {
      'body': {
        'company-id': companyId,
        'category-id': categoryId,
        'tier': 'TIER_2',
        'response': 'FULLY_MET',
      },
      'user': {
        'id': userId,
      },
    };

    // Mock store
    const store = {};
    store.getActiveSATCycle = jest.fn().mockReturnValue({id: cycleId});
    store.updateOrCreateSATAnswer = jest.fn().mockResolvedValue(true);

    // Mock guard
    jest.spyOn(guards, 'isCompanyMember').mockImplementation(() => true);

    // Mock response
    const res = {};
    res.json = jest.fn(() => res);

    // Run handler
    await submitSATAnswer(store)(req, res);

    // Assertions
    expect(store.updateOrCreateSATAnswer).toBeCalledWith(
      userId,
      companyId,
      categoryId,
      'TIER_2',
      'FULLY_MET',
      2.5, // This ensures that the calculation is accurate
      cycleId
    );
    expect(res.json).toHaveBeenCalledTimes(1);
  });
});
