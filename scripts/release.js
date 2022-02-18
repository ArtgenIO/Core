const { Select } = require('enquirer');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { parse, stringify } = require('semver-utils');
const { execSync } = require('child_process');

const prompt = new Select({
  name: 'semver',
  message: 'Choose a version change level (semver):',
  choices: ['patch', 'minor', 'major'],
});

prompt
  .run()
  .then(async answer => {
    const vfile = join(__dirname, '../version');
    const pfile = join(__dirname, '../package.json');
    const current = readFileSync(vfile).toString();
    console.log('Current version:', current);

    const semver = parse(current);

    semver[answer] = parseInt(semver[answer], 10) + 1;

    switch (answer) {
      case 'minor':
        semver.patch = 0;
        break;
      case 'major':
        semver.minor = 0;
        semver.patch = 0;
        break;
    }

    const bumped = stringify(semver);
    console.log('New version:', bumped);

    const package = require(pfile);
    package.version = bumped;

    writeFileSync(pfile, JSON.stringify(package, null, 2));
    writeFileSync(vfile, bumped);

    console.log('Version updated');

    execSync(
      `git add version package.json && git commit -m "Release ${bumped}"`,
      {
        cwd: join(__dirname, '../'),
      },
    );

    console.log('Commit made for the automatic release');
  })
  .catch(console.error);
