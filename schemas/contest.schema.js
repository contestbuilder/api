'use strict';

module.exports = `
    type Contest {
        id:           Int
        author:       User
        name:         String
        nickname:     String
        created_at:   String
        scheduled_to: Int
        deleted_at:   String

        contributors: [User]
        problems:     [Problem]
    }
`;
