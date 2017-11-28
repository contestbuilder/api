'use strict';

module.exports = `
    type TestCase {
        id:             Int
        author:         User
        problem:        Problem
        input:          String
        output:         String
        input_file:     String
        output_file:    String
        input_text_id:  Int
        output_text_id: Int
        order:          Int
        last_edit:      Date
        deleted_at:     Date

        problem: Problem
    }
`;
