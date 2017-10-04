'use strict';

var fs      = require('fs'),
	path    = require('path'),
	tmp     = require('tmp'),
	nodeZip = require('node-zip'),
	aws     = require('./aws.lib'),
	fileLib = require('./file.lib'),
	s3      = aws.s3;


function buildBocaZip(contestNickname, problems, bocaFilesVersion) {
	var tmpFileDir = tmp.dirSync().name;

	var problemPromises = problems.map(function(problem) {
		fs.mkdirSync(path.join(tmpFileDir, problem.nickname));
		var problemFileDir = path.join(tmpFileDir, problem.nickname);

		return Promise.resolve({})
			.then(downloadBocaFiles.bind(null, problemFileDir, bocaFilesVersion || 'v1'))
			.then(writeProblemFiles.bind(null, contestNickname, problemFileDir, problem))
			.catch(function(err) {
				console.log('err: ' + err);
			});
	});

	return Promise.all(problemPromises)
		.then(zipFiles.bind(null, tmpFileDir, contestNickname))
		.then(uploadToS3.bind(null, contestNickname))
		.then(function(uploadData) {
			return {
				VersionId: uploadData.VersionId
			};
		})
		.catch(function(err) {
			console.log('err on compression: ' + err);

			return {
				err: err
			};
		});
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

function writeProblemFiles(contestNickname, problemTempDir, problem) {
	var problemLastVersion = problem.v[ problem.v.length-1 ];

	return Promise.resolve()
		.then(function() {
			// description
			fs.mkdirSync(path.join(problemTempDir, 'description'));

			// problem letter
			var problemLetter = String.fromCharCode(96 + problemLastVersion.order);

			// if the file was uploaded
			if(problem.file && problem.file.name) {
				// description info
				var problemInfo = 'basename=' + problemLetter + '\n' +
					'fullname=' + problem.name + '\n' +
					'descfile=' + problem.file.name;
				fs.writeFileSync(path.join(problemTempDir, 'description', 'problem.info'), problemInfo);

				return downloadAndWriteFile(
					fileLib.replacePathWithParams('problemDescription', {
						contest_nickname: contestNickname,
						problem_nickname: problem.nickname,
						file_name:        problem.file.name
					}),
					path.join(problemTempDir, 'description', problem.file.name)
				);
			}
			// if there's no file uploaded
			else {
				var descFile = path.join(problemTempDir, 'description', problem.nickname + '.txt');
				fs.writeFileSync(descFile, problemLastVersion.description);

				// description info
				var problemInfo = 'basename=' + problemLetter + '\n' +
					'fullname=' + problem.name + '\n' +
					'descfile=' + problem.nickname + '.txt';
				fs.writeFileSync(path.join(problemTempDir, 'description', 'problem.info'), problemInfo);

				return true;
			}
		})
		.then(function() {
			// input/output files
			fs.mkdirSync(path.join(problemTempDir, 'input'));
			fs.mkdirSync(path.join(problemTempDir, 'output'));

			problem.test_cases.forEach(function(test_case, index) {
				var testCaseLastVersion = test_case.v[ test_case.v.length-1 ];

				fs.writeFileSync(path.join(problemTempDir, 'input', (index + 1).toString()), testCaseLastVersion.input);
				fs.writeFileSync(path.join(problemTempDir, 'output', (index + 1).toString()), testCaseLastVersion.output);
			});

			return true;
		})
		.then(function() {
			// limits
			fs.mkdirSync(path.join(problemTempDir, 'limits'));

			[ 'c', 'cpp', 'java' ].forEach(function(language) {
				var limitDesc = 
					'echo ' + problemLastVersion.time_limit + '\n' +
					'echo 10\n' +
					'echo 512\n' +
					'echo 1024\n' +
					'exit 0\n';

				fs.writeFileSync(path.join(problemTempDir, 'limits', language), limitDesc);
			});

			return true;
		});
}

function zipFiles(tempDir, contestNickname) {
	var zip = new JSZip();

	recursivelyAddToZip(zip, '', tempDir);

	var data = zip.generate({
		base64:      false,
		compression: 'DEFLATE'
	});
	var zipPath = path.join(tempDir, contestNickname + '.zip');
	fs.writeFileSync(zipPath, data, 'binary');

	return Promise.resolve(zipPath);
}

function recursivelyAddToZip(zip, currentZipPath, currentOsPath) {
	var files = fs.readdirSync(currentOsPath);

	files.forEach(function(file) {
		var fileStat   = fs.statSync(path.join(currentOsPath, file)),
			newZipPath = (currentZipPath ? currentZipPath + '/' : '') + file,
			newOsPath  = path.join(currentOsPath, file);

		if(fileStat.isDirectory()) {
			recursivelyAddToZip(zip, newZipPath, newOsPath);
		} else if(fileStat.isFile()) {
			zip.file(newZipPath, fs.readFileSync(newOsPath));
		}
	});
}

function uploadToS3(contestNickname, zipPath) {
	return aws.s3uploadFile(
		fileLib.replacePathWithParams('bocaZip', {
			contest_nickname: contestNickname
		}),
		zipPath
	);
}


module.exports = {
	buildBocaZip: buildBocaZip
};
