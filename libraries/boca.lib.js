'use strict';

var fs   = require('fs'),
	path = require('path'),
	tmp  = require('tmp'),
	aws  = require('./aws.lib'),
	s3   = aws.s3;


function buildBocaZip(contestName, problems, bocaFilesVersion) {
	var tmpFileDir = tmp.dirSync().name;
	console.log('temp dir', tmpFileDir);

	var problemPromises = problems.map(function(problem) {
		fs.mkdirSync(path.join(tmpFileDir, problem.nickname));
		var problemFileDir = path.join(tmpFileDir, problem.nickname);

		return Promise.resolve({})
			.then(downloadBocaFiles.bind(null, problemFileDir, bocaFilesVersion || 'v1'))
			.then(writeProblemFiles.bind(null, problemFileDir, problem))
			.then(function(params) {
				console.log(params);
			})
			.catch(function(err) {
				console.log('err: ' + err);
			});
	});

	return Promise.all(problemPromises);
}

function downloadBocaFiles(tmpFileDir, bocaVersion) {
	switch(bocaVersion) {
		case 'v1':
		default:
			fs.mkdirSync(path.join(tmpFileDir, 'compare'));
			fs.mkdirSync(path.join(tmpFileDir, 'compile'));
			fs.mkdirSync(path.join(tmpFileDir, 'run'));
			fs.mkdirSync(path.join(tmpFileDir, 'tests'));

			return Promise.all([
				downloadAndWriteFile('boca/v1/compare/c',    path.join(tmpFileDir, 'compare', 'c')),
				downloadAndWriteFile('boca/v1/compare/cpp',  path.join(tmpFileDir, 'compare', 'cpp')),
				downloadAndWriteFile('boca/v1/compare/java', path.join(tmpFileDir, 'compare', 'java')),

				downloadAndWriteFile('boca/v1/compile/c',    path.join(tmpFileDir, 'compile', 'c')),
				downloadAndWriteFile('boca/v1/compile/cpp',  path.join(tmpFileDir, 'compile', 'cpp')),
				downloadAndWriteFile('boca/v1/compile/java', path.join(tmpFileDir, 'compile', 'java')),
				downloadAndWriteFile('boca/v1/compile/pas',  path.join(tmpFileDir, 'compile', 'pas')),

				downloadAndWriteFile('boca/v1/run/c',    path.join(tmpFileDir, 'run', 'c')),
				downloadAndWriteFile('boca/v1/run/cpp',  path.join(tmpFileDir, 'run', 'cpp')),
				downloadAndWriteFile('boca/v1/run/java', path.join(tmpFileDir, 'run', 'java')),
			]);
	}
}

function downloadAndWriteFile(s3Path, downloadPath) {
	return aws.s3downloadFile(s3Path)
		.then(function(data) {
		    fs.writeFileSync(downloadPath, data.Body);

		    return downloadPath;
		});
}

function writeProblemFiles(problemTempDir, problem) {
	var problemLastVersion = problem.v[ problem.v.length-1 ];

	fs.mkdirSync(path.join(problemTempDir, 'description'));
	// description txt
	var descFile = path.join(problemTempDir, 'description', problem.nickname + '.txt');
	fs.writeFileSync(descFile, problemLastVersion.description);
	// description info
	var problemInfo = 'basename=' + problem.nickname + '\n' +
		'fullname=' + problem.name + '\n' +
		'descfile=' + problem.nickname + '.txt';
	fs.writeFileSync(path.join(problemTempDir, 'description', 'problem.info'), problemInfo);

	// input/output files
	fs.mkdirSync(path.join(problemTempDir, 'input'));
	fs.mkdirSync(path.join(problemTempDir, 'output'));
	problem.test_cases.forEach(function(test_case, index) {
		var testCaseLastVersion = test_case.v[ test_case.v.length-1 ];

		fs.writeFileSync(path.join(problemTempDir, 'input', (index + 1).toString()), testCaseLastVersion.input);
		fs.writeFileSync(path.join(problemTempDir, 'output', (index + 1).toString()), testCaseLastVersion.output);
	});

	// limits
	fs.mkdirSync(path.join(problemTempDir, 'limits'));
	[ 'c', 'cpp', 'java' ].forEach(function(language) {
		var limitDesc = 'echo ' + problemLastVersion.time_limit + '\n' +
			'echo 10\n' +
			'echo 512\n' +
			'echo 1024\n' +
			'exit 0\n';

		fs.writeFileSync(path.join(problemTempDir, 'limits', language), limitDesc);
	});

	return Promise.resolve();
}

buildBocaZip('123', [{
	nickname: 'abc',
	name: 'abc',
	v: [{
		description: 'muito bom',
		time_limit: 2
	}],
	test_cases: [{
		v: [{
			input: '1\n',
			output: '2\n'
		}]
	}, {
		v: [{
			input: '3\n',
			output: '4\n'
		}]
	}]
}], 'v1');


module.exports = {
	buildBocaZip: buildBocaZip
};
