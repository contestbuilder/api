'use strict';

module.exports = `
    type Solution {
        id:               Int
        author:           User
        name:             String
        nickname:         String
        language:         String
        expected_verdict: String
        source_code:      String
        order:            Int
        last_edit:        Date
        deleted_at:       Date

        problem: Problem

        runs(
            solution_run_id: Int
        ): [SolutionRun]
    }
`;
