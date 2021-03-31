const fs = require('fs');
const chalk = require("chalk");
const {execSync} = require('child_process');
const data = require('../config.deploy.json');
const path = require("path");

const rollback = () => {
    console.error(chalk.redBright('DEPLOY FAILED!! ROLLING BACK!!'));
    try {
        execSync(data.commands.start, {cwd: path.join(process.cwd(), `${version}`)});
    } catch (e) {
        console.error(chalk.blackBright(chalk.bgRed('FAILED ROLLING BACK!! CALL FIREFIGHTERS!!')));
    }
}

const saveNewVersion = () => {
    const newData = {...data, version: version + 1};
    fs.writeFileSync(path.join(process.cwd(), './config.deploy.json'), JSON.stringify(newData, undefined, 3))
    console.log(chalk.greenBright('Saving new version'));
}

const version = data.version;
try {
    execSync(`mkdir ${path.join(process.cwd(), data.folder, `${version + 1}`)}`);

    console.log(chalk.bold('Folder created successfully'));

    execSync(`git clone ${data.github} ${version + 1}`, {cwd: path.join(process.cwd(), data.folder), stdio: 'ignore'});

    console.log(chalk.bold('Project cloned'));

    console.log(chalk.bold('Installing dependencies'));

    execSync('yarn install', {cwd: path.join(process.cwd(), data.folder, `${version + 1}`), stdio: 'ignore'});
} catch (e) {
    console.error(e);
    console.log(chalk.bold('FAILED INSTALLATION!!'));
    process.exit(1);
}


try {
    console.log(chalk.greenBright('Dependencies installed, start with change new version'));
    if (fs.existsSync(path.join(process.cwd(), data.folder, `${version}`))) {
        execSync(data.commands.stopOldApp, {cwd: path.join(process.cwd(), data.folder, `${version}`)});
    }

    execSync(data.commands.build, {cwd: path.join(process.cwd(), data.folder, `${version + 1}`)});

    execSync(data.commands.start, {cwd: path.join(process.cwd(), data.folder, `${version + 1}`)});

    saveNewVersion();
} catch (e) {
    console.error(e);
    rollback();
}



