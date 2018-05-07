'use strict';

module.exports = `
    type TestCase {
        id:             Int
        input:          String
        output:         String
        order:          Int
        last_edit:      Date
        deleted_at:     Date
        input_text_id:  Int
        output_text_id: Int

        author:  User
        problem: Problem

        input_file:  File
        output_file: File
    }
`;
