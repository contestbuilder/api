var status = require('http-status');

module.exports = function(wagner) {
    wagner.factory('handleService', function(Log) {

        // handle possible errors after a call,
        // such as internal errors, or not found elements.
        function handleError(res, error, result) {
            if(error) {
                res
                    .status(status.INTERNAL_SERVER_ERROR)
                    .json({ error: error.toString() });
                return false;
            }
            if(result !== undefined && !result) {
                res
                    .status(status.NOT_FOUND)
                    .json({ error: 'Not found' });
                return false;
            }

            return true;
        }

        // handle the findOne call, and if there are no errors
        // (there is only one element found), returns it.
        function handleOne(property, res, error, result) {
            if(!handleError(res, error, result)) {
                return;
            }

            var json = {};
            json[property] = result;
            res.json(json);
        }

        // handle the findOne call, and calls a callback with the result.
        function findOne(res, cb, error, result) {
            if(!handleError(res, error, result)) {
                return;
            }

            cb(result);
        }

        // logs an action, with the user logged in (in the req obj),
        // and return the object.
        function logAction(property, logParams, req, res, error, result) {
            if(!handleError(res, error, result)) {
                return;
            }

            logParams.author = req.user._id;
            var log = new Log(logParams);

            log.save(function(err, logDoc) {
                if(err) {
                    return res
                        .status(status.INTERNAL_SERVER_ERROR)
                        .json({ error: err.toString() });
                }

                var json = {};
                json[property] = result;
                return res.json(json);
            });
        }

        // handle the find call, and return the list of found docs
        // (it may return none).
        function handleMany(property, res, error, result) {
            if(!handleError(res, error)) {
                return;
            }

            var json = {};
            json[property] = result;
            res.json(json);
        }

        // handle the save call, and return the saved object.
        function handleSave(property, res, error, result) {
            if(!handleError(res, error)) {
                return;
            }

            var json = {};
            json[property] = result;
            res.json(json);
        }

        function handleSaveCallback(res, cb, error, result) {
            if(!handleError(res, error)) {
                return;
            }

            cb(result);
        }

        // check if there are required fields that are missing.
        function handleRequired(res, body, requiredFields) {
            var missing = [];

            requiredFields.forEach(function(field) {
                if(body[field] === undefined) {
                    missing.push(field);
                }
            });

            if(missing.length) {
                res
                    .status(status.BAD_REQUEST)
                    .json({
                        error: 'The following fields are required and missing: ' + missing.join(', ') + '.'
                    });
                return false;
            }
            return true;
        }

        return {
            handleError:        handleError,
            handleOne:          handleOne,
            findOne:            findOne,
            logAction:          logAction,
            handleMany:         handleMany,
            handleSave:         handleSave,
            handleSaveCallback: handleSaveCallback,
            handleRequired:     handleRequired
        };
    });
}
