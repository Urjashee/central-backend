const appRoot = require('app-root-path');
const Problem = require(appRoot + '/lib/util/problem');

const _create = (prefix) => (openRosaUrl, xmlFormId, token) => new Promise((resolve, reject) => {
  const state = global.enketoPreviewTest;
  global.enketoPreviewTest = null;
  const token = global.enketoToken || `${prefix}abcdefgh`;
  global.enketoToken = null;
  global.enketoReceivedUrl = null;

  if (state === 'error') {
    // pretend that Enketo has misbehaved
    reject(Problem.internal.enketoUnexpectedResponse('wrong status code'));
  } else {
    global.enketoReceivedUrl = openRosaUrl;
    resolve(token);
  }
});

module.exports = { create: _create('::'), createSingle: _create('::::') };

