// Tests run against the TypeScript compiled by `tsc -p tsconfig.test.json`.
const path = require('node:path');
const load = rel => require(path.join(__dirname, '..', '.test-build', 'src', rel));
module.exports = { load };
