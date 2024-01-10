const path = require("path");
const fs = require("fs");
const sass = require("sass");
const colors = require("colors");
const { globSync } = require("glob");
const dotenv = require("dotenv");

dotenv.config();
colors.enable();

const FLUENT_UI_STYLE_PATH = process.env.FLUENT_UI_STYLE_PATH;
const FLUENT_UI_DIST_PATH = process.env.FLUENT_UI_DIST_PATH;

async function compileScssToCss(filePath) {

	if (!fs.existsSync(filePath))
		return console.log(`[ERROR]: Cannot compile SCSS to CSS because the given file path does not exist '${filePath}'.`.red);

	const outputFileName = path.basename(filePath).replace(".scss", ".css");
	const outputFilePath = path.join(FLUENT_UI_DIST_PATH, outputFileName);

	try {

		const scssOutput = await sass.compileAsync(filePath, {
			style: "compressed",
			sourceMap: true,
			verbose: false
		});

		fs.writeFileSync(outputFilePath, scssOutput.css, { encoding: "utf-8" });

		console.log(`${"[INFO]:".green} Succesfully compiled ${filePath.green} into CSS to ${outputFilePath.green}.`);
	} catch (err) {

		console.log(`[ERROR]: ${err.message}.red`);
	}
}

function main() {

	console.log(`${"[INFO]:".green} Preparing to compile SCSS...`);

	if (typeof FLUENT_UI_DIST_PATH === "undefined" || typeof FLUENT_UI_STYLE_PATH === "undefined") {
		console.log("[ERROR]: Cannot start program because environment variables has not been set up correctly.".red);
		return console.log("[ERROR]: Expected variable in .env FLUENT_UI_STYLE_PATH and FLUENT_UI_DIST_PATH.".red);
	}

	if (!fs.existsSync(FLUENT_UI_STYLE_PATH))
		return console.log(`[ERROR]: Cannot compile SCSS to CSS because the given path '${FLUENT_UI_STYLE_PATH}' does not exist.`.red);

	if (!fs.existsSync(FLUENT_UI_DIST_PATH))
		return console.log(`[ERROR]: Cannot compile SCSS to CSS because the given path '${FLUENT_UI_DIST_PATH}' does not exist.`.red);

	const scssFileNames = globSync("**/*.scss", { cwd: FLUENT_UI_STYLE_PATH });

	console.log(`${"[INFO]:".green} Found ${scssFileNames.length.toString().green} SCSS file names in ${FLUENT_UI_STYLE_PATH}.`);

	for (let fileName of scssFileNames) {

		const physicalFilePath = path.join(FLUENT_UI_STYLE_PATH, fileName);

		compileScssToCss(physicalFilePath);
	}
}

main();