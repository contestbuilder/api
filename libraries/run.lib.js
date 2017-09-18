'use strict';

var fs        = require('fs'),
	exec      = require('child_process').exec,
	path      = require('path'),
	os        = require('os'),
	mongoose  = require('mongoose');

function run(source_code, language, time_limit, input, output, context) {
	var created_files = [];

	return new Promise(function(resolve, reject) {
		var run_id = new mongoose.mongo.ObjectId();

		var tmp_file_dir = os.tmpdir();
		var input_file_name = path.join(tmp_file_dir, run_id.toString() + '.in');

		var source_file_name, compiled_file_name;
		var compile_cmd, run_cmd;
		switch(language) {
			case 'cpp':
				source_file_name   = path.join(tmp_file_dir, run_id.toString() + '.cpp');
				compiled_file_name = path.join(tmp_file_dir, run_id.toString() + '.exe');

				compile_cmd = 'g++ ' + source_file_name + ' -o ' + compiled_file_name;
				run_cmd     = compiled_file_name + ' < ' + input_file_name;
				break;

			default:
				return resolve({
					_id:     run_id,
					success: false,
					err:     'Language not supported',
					context: context,
					verdict: 'Other'
				});
		}

		console.log('Writing source code to a file (' + source_file_name + ')');
		created_files.push(source_file_name);
		fs.writeFileSync(source_file_name, source_code, 'utf8');

		console.log('Writing input to a file (' + input_file_name + ')');
		created_files.push(input_file_name);
		fs.writeFileSync(input_file_name, input, 'utf8');

		console.log('Compiling the code');
		created_files.push(compiled_file_name);
		exec(compile_cmd, function(err, stdout, stderr) {
			if(err) {
				console.log('Error compiling the code: ' + err);
				unlinkFiles(created_files);
				return resolve({
					_id:     run_id,
					success: false,
					err:     'Error compiling the code: ' + err,
					context: context,
					verdict: 'Compilation error'
				});
			}

			console.log('Running the code');
			exec(run_cmd, {
				timeout: time_limit * 1000
			}, function(err, stdout, stderr) {
				if(err) {
					console.log('Error running the code: ' + err);
					unlinkFiles(created_files);
					return resolve({
						_id:     run_id,
						success: false,
						err:     'Error running the code: ' + err,
						context: context,
						verdict: 'Other'
					});
				}

				console.log('Done');
				var verdict = getVerdict(output, stdout);

				unlinkFiles(created_files);
				return resolve({
					_id:      run_id,
					success:  true,
					output:   stdout,
					context:  context,
					verdict:  verdict,
					duration: 1
				});
			});
		});
	});
}

function unlinkFiles(files) {
	console.log('unlinking files');
	files.forEach(function(file) {
		if(fs.existsSync(file)) {
			try {
				fs.unlinkSync(file);
			} catch(err) {
				console.log('Error unlinking file ' + file + ': ' + err);
			}
		}
	});
}

function getVerdict(expectedOutput, output) {
	expectedOutput = expectedOutput.replace(/\r/g, '');
	output         = output.replace(/\r/g, '');
	if(expectedOutput == output) {
		return 'Accepted';
	}

	expectedOutput = expectedOutput.replace(/\n/g, '');
	output         = output.replace(/\n/g, '');
	if(expectedOutput == output) {
		return 'Presentation error';
	}

	return 'Wrong answer';
}

module.exports = {
	run: run
};
