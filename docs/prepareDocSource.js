const _ = require('lodash');
const fs = require('fs');

const path = require('path');
const srcRoot = path.join(__dirname, '../src/lib');

fs.readdir(srcRoot, (err, folders) => {

	// Making sure we are only dealing with lib folders
	const libFolders = _.filter(folders, (f) => {
		const fullPath = path.join(srcRoot, f);
		return fs.lstatSync(fullPath).isDirectory();
	});

	const whilelist = /^[\d\w]+.ts$/;
	const blackList = ['index.ts', 'index.repl.ts'];
	// Squashing lib into a file
	const libFiles = _.map(libFolders, (folder) => {

		// Getting the folder full path
		const fullPath = path.join(srcRoot, folder);

		// Filtering files by whitelist and blacklist
		const filteredFiles = _.flowRight(
			// Filter by whitelist -> *.ts
			files => _.filter(files, (libFile) => {
				return whilelist.test(libFile);
			}),
			// Filter out blacklist -> index.ts
			files => _.filter(files, (libFile) => {
				return blackList.indexOf(libFile) === -1;
			}),
			p => fs.readdirSync(p)
		)(fullPath);

		return _.map(filteredFiles, (file) => {
			return path.join(folder, file);
		});
	});

	console.log('Checking error', err);
	console.log('getting the list dir', folders);
	console.log('lib folders ', libFolders);
	console.log('libFiles', libFiles);
});
