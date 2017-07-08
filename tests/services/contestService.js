module.exports = function(wagner) {
    wagner.factory('contestService', function(Contest, userService) {

        function newContest(users) {
            var author, contributors = [];
            if(Array.isArray(users)) {
                author = users[0]._id;
                users.forEach(function(user) {
                    contributors.push(user._id.toString());
                });
            } else {
                author = users._id;
                contributors.push(users._id.toString());
            }

            return {
                author: author,
                name: 'contest_' + Math.random().toString(36).substring(7),
                contributors: contributors
            };
        }

        function newContests(qty, users) {
            var contests = [];
            for(var i=0; i<qty; i++) {
                contests.push(newContest(users));
            }
            return contests;
        }

        function createContest(option, cb, userOption) {
            userService.createUser(userOption, function(err, userDoc) {
                var contest;
                if(typeof option == 'number') {
                    contest = newContests(option, userDoc);
                }
                else if(option !== null && typeof option == 'object') {
                    contest = option;
                }
                else {
                    contest = newContest(userDoc);
                }

                if(contest instanceof Contest) {
                    cb(null, contest);
                } else {
                    Contest.create(contest, cb);
                }
            });
        }

        return {
            newContest:    newContest,
            newContests:   newContests,
            createContest: createContest
        };
    });
}
