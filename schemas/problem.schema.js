'use strict';

module.exports = `
    type Problem {
        id:          Int
        name:        String
        nickname:    String
        description: String
        time_limit:  Int
        order:       Int
        deleted_at:  Date

        contest: Contest

        author: User

        file: File

        solutions(
            solution_id:  Int,
            show_deleted: Boolean
        ): [Solution]

        checkers(
            checker_id:   Int,
            show_deleted: Boolean
        ): [Checker]

        test_cases(
            test_case_id: Int,
            show_deleted: Boolean
        ): [TestCase]
    }
`;
