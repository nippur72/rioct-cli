const cli = require('./cli');
const exitCode = cli.main(process.argv);
process.exit(exitCode);
