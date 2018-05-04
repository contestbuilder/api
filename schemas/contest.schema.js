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

        contributors(
            contributor_id: Int
        ): [User]

        problems(
            problem_id:   Int,
            show_deleted: Boolean
        ): [Problem]
    }
`;
