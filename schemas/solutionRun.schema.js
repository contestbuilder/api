'use strict';

module.exports = `
    type SolutionRun {
        id:             Int
        number:         Int
        output:         String
        output_text_id: Int
        duration:       Float
        success:        Boolean
        verdict:        String
        timestamp:      Date

        solution:  Solution
        test_case: TestCase
    }
`;
