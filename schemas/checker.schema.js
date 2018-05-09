'use strict';

module.exports = `
    type Checker {
        id:          Int
        author:      User
        name:        String
        nickname:    String
        language:    String
        source_code: String
        order:       Int
        last_edit:   Date
        deleted_at:  Date
        text_id:     Int

        file: File

        problem: Problem
    }
`;
