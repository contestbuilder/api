module.exports = function(wagner) {

	require('./userService')(wagner);
	require('./contestService')(wagner);
	require('./assertService')(wagner);
	require('./loginService')(wagner);

};