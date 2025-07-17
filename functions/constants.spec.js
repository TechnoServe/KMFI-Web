const assert = require('assert');
const {SAT_SCORING_INDEX} = require('./constants');

describe('Test computed constants', () => {
  it('SAT_SCORING_INDEX values should be numbers', () => {
    assert.strictEqual((typeof SAT_SCORING_INDEX.MAX_POINTS), 'number');
    assert.strictEqual((typeof SAT_SCORING_INDEX.FULLY_MET), 'number');
    assert.strictEqual((typeof SAT_SCORING_INDEX.MOSTLY_MET), 'number');
    assert.strictEqual((typeof SAT_SCORING_INDEX.PARTLY_MET), 'number');
    assert.strictEqual((typeof SAT_SCORING_INDEX.NOT_MET), 'number');
    assert.strictEqual((typeof SAT_SCORING_INDEX.TIER_1), 'number');
    assert.strictEqual((typeof SAT_SCORING_INDEX.TIER_2), 'number');
    assert.strictEqual((typeof SAT_SCORING_INDEX.TIER_3), 'number');
  });
});
