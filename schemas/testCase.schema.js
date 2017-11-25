'use strict';

module.exports = `
    type TestCase {
        id:          Int
        author:      User
        problem:     Problem
        input:       String
        output:      String
        input_file:  String
        output_file: String
        order:       Int
        deleted_at:  Date

        problem: Problem
    }
`;
