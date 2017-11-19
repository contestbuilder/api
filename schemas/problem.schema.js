'use strict';

module.exports = `
    type Problem {
        id:           Int
        author:       User
        name:         String
        nickname:     String
        description:  String
        file_url:     String
        time_limit:   Int
        order:        Int
        deleted_at:   String
    }
`;
