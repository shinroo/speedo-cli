#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const speedTest = require('speedtest-net');
const Table = require('cli-table3');
const ora = require('ora');

const arg = process.argv[2];
const spinner = ora();

// Help message
if (arg === '-h' || arg === '--help') {
	console.log(`
 Usage:
  Just run ${chalk.green.bold('speedo')} to start a speed test!

 Powered by ${chalk.cyan('speedtest.net')}

 `);
	process.exit(0);
}

// Speed test config
const st = speedTest({maxTime: 5250});
// Output in MB/s
st.on('data', async data => {
	const download = (data.speeds.download * 0.125).toFixed(2);
	const upload = (data.speeds.upload * 0.125).toFixed(2);

	// Table
	const table = new Table({
		head: [`${chalk.red.bold('Type:')}`, `${chalk.red.bold('Speed:')}`],
		colWidths: [25, 25]
	});

	await table.push(
		[`${chalk.cyan('Download')}`, `${chalk.green(`${download}`)} MB/s`]
		, [`${chalk.cyan('Upload')}`, `${chalk.green(`${upload}`)} MB/s`]
		,	[`${chalk.cyan('Latency')}`, `${chalk.green(`${data.server.ping}`)} ms`]
	);

	// Print the final report table
	spinner.succeed(`Done! Here is your speed report:\n`);
	console.log(table.toString());
});

// Download and Upload speed log
st.on('downloadspeedprogress', speed => {
	spinner.text = `Testing download speed... ${chalk.green(`${(speed * 0.125).toFixed(2)} MB/s`)}`;
	spinner.start();
});
st.on('uploadspeedprogress', speed => {
	spinner.text = `Testing upload speed... ${chalk.yellow(`${(speed * 0.125).toFixed(2)} MB/s`)}`;
	spinner.start();
});

// Handle the error
st.on('error', err => {
	/* istanbul ignore next */
	if (err.code === 'ENOTFOUND') {
		console.error(chalk.red.bold(`Unable to connect to the server :(`));
	}
});
