'use strict';

var userFields    = [ '__v', 'username', 'password', 'email', '_id' ];
var contestFields = [ '__v', 'author', 'name', 'nickname', 'created_at', 'contributors', 'problems', 'active', '_id' ];

function replaceIds(list, ids, fields) {
    for(var i = 0; i < list.length; i++) {
        for(var j = 0; j < ids.length; j++) {
            list[i] = replaceId(list[i], ids, fields);
        }
    }
}

function replaceId(_id, ids, fields) {
    for(var i = 0; i < ids.length; i++) {
        if(_id == ids[i]._id || _id.toString() == ids[i]._id.toString()) {
            if(Array.isArray(fields)) {
        		var obj = {};
        		fields.forEach(function(field) {
        			obj[field] = ids[i][field];
        		});
        		return obj;
        	} else {
        		return ids[i];
        	}
        }
    }
    return _id;
}

module.exports = {
	replaceId:     replaceId,
	replaceIds:    replaceIds,
	userFields:    userFields,
    contestFields: contestFields
};