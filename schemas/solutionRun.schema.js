'use strict';

module.exports = `
    type SolutionRun {
        id:        Int
        number:    Int
        output:    String
        duration:  Float
        success:   Boolean
        verdict:   String
        timestamp: Date

        solution:  Solution
        test_case: TestCase
    }
`;
