import { execSync } from 'child_process';
import enquirer from 'enquirer';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse, stringify } from 'semver-utils';

const prompt = new enquirer.Select({
  name: 'semver',
  message: 'Choose a version change level (semver):',
  choices: ['patch', 'minor', 'major'],
});

prompt
  .run()
  .then(async answer => {
    const vfile = join(process.cwd(), 'version');
    const pfile = join(process.cwd(), 'package.json');
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

    const pkg = JSON.parse(readFileSync(pfile));
    pkg.version = bumped;

    writeFileSync(pfile, JSON.stringify(pkg, null, 2));
    writeFileSync(vfile, bumped);

    console.log('Version updated');

    execSync(
      `git add version package.json && git commit -m "Release ${bumped}"`,
      {
        cwd: process.cwd(),
      },
    );

    console.log('Commit made for the automatic release');
  })
  .catch(console.error);
