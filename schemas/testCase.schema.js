'use strict';

module.exports = `
    type TestCase {
        id:             Int
        input:          String
        output:         String
        input_file_id:  Int
        output_file_id: Int
        input_text_id:  Int
        output_text_id: Int
        order:          Int
        last_edit:      Date
        deleted_at:     Date

        author:  User
        problem: Problem

        input_file:  File
        output_file: File
    }
`;
