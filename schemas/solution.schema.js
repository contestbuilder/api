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
        deleted_at:       Date

        problem: Problem
    }
`;
