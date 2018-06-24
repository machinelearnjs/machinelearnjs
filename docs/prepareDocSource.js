const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

// Params
const srcRoot = path.join(__dirname, '../src/lib');
const outdir = path.join(__dirname, 'doc_source');
const whilelist = /^[\d\w]+.ts$/;
const blackList = ['index.ts', 'index.repl.ts'];

fs.readdir(srcRoot, (err, folders) => {

	if (err) {
		console.error(err);
		exit();
	}

	// Cleaning the existing output directory
	if (!fs.existsSync(outdir)){
		fs.removeSync(outdir);
	}

	// Making sure we are only dealing with lib folders
	const libFolders = _.filter(folders, (f) => {
		const fullPath = path.join(srcRoot, f);
		return fs.lstatSync(fullPath).isDirectory();
	});


	// Getting library files
	// e.g. [ ensemble/forest.ts ], [ preprocessing/Imputer.ts ]
	// TODO Support deeper file path files
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

	// Creating the source out directory if not exists
	if (!fs.existsSync(outdir)){
		fs.mkdirSync(outdir);
	}

	// Writing to each module file
	_.forEach(libFiles, (files) => {
		// from [ ensemble/forest.ts ] -> [ensemble, forest.ts] -> ensemble
		const moduleName = files[0].split('/')[0];
		const outputModuleFile = path.join(outdir, `${moduleName}.ts`);

		_.forEach(files, (f) => {
			const fullFilePath = path.join(srcRoot, f);
			const moduleContent = fs.readFileSync(fullFilePath);
			fs.appendFileSync(outputModuleFile, moduleContent, { flag: 'a' });
		});
	});

	console.log('List of module folders: \n', libFolders);
	console.log('List of module files: \n', libFiles);
});
