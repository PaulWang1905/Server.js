/*! @license ©2015 Miel Vander Sande - Multimedia Lab / iMinds / Ghent University */

/** An SummaryController responds to requests for summaries */

var Controller = require('./Controller'),
    fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    _ = require('lodash'),
    StreamParser = require('n3').StreamParser,
    Util = require('../Util');

// Creates a new SummaryController
function SummaryController(options) {
  if (!(this instanceof SummaryController))
    return new SummaryController(options);
  options = options || {};
  Controller.call(this, options);

  // Settings for data summaries
  var summaries = options.summaries || {};
  this._summariesFolder = summaries.dir || path.join(__dirname, '../../summaries');

  // Set up path matching
  this._summariesPath = summaries.path  || '/summaries/',
  this._matcher = new RegExp('^' + Util.toRegExp(this._summariesPath) + '(.+)$');
}
Controller.extend(SummaryController);

// Try to serve the requested summary
SummaryController.prototype._handleRequest = function (request, response) {
  var summaryMatch = this._matcher && this._matcher.exec(request.url), datasource;
  if (datasource = summaryMatch && summaryMatch[1]) {
    var summaryFile = path.join(this._summariesFolder, datasource + '.ttl');

    // Read summary triples from file
    var self = this,
        streamParser = new StreamParser(),
        inputStream = fs.createReadStream(summaryFile);
    inputStream.pipe(streamParser);

    inputStream.on('error', function (error) {
      // Cache 404 responses
      response.setHeader('Cache-Control', 'public,max-age=3600');

      // Render the 404 message using the appropriate view
      var view = self._negotiateView('NotFound', request, response),
          metadata = { url: request.url, prefixes: self._prefixes, datasources: self._datasources };
      response.writeHead(404);
      view.render(metadata, request, response);
    });

    // Write the query result
    var view = this._negotiateView('Summary', request, response);

    view.render({ resultStream: streamParser }, request, response);
  }
  return !!datasource;
};

module.exports = SummaryController;