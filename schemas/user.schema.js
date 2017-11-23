'use strict';

module.exports = `
    type User {
        id:         Int
        name:       String
        username:   String
        email:      String
        deleted_at: Date

        contests: [Contest]
    }
`;
