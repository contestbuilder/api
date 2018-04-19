'use strict';

module.exports = `
    type Contest {
        id:           Int
        author:       User
        name:         String
        nickname:     String
        created_at:   Date
        scheduled_to: Int
        deleted_at:   Date

        contributors(id: Int): [User]
        problems:              [Problem]
    }
`;
