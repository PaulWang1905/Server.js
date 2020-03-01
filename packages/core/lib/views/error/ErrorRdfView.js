/*! @license MIT ©2015-2016 Ruben Verborgh, Ghent University - imec */
/* An ErrorRdfView represents a 500 response in RDF. */

var RdfView = require('../RdfView');

// Creates a new ErrorRdfView
class ErrorRdfView extends RdfView {
  constructor(settings) {
    super('Error', settings);
  }
}
RdfView.extend(ErrorRdfView);

// Generates triples and quads by sending them to the data and/or metadata callbacks
ErrorRdfView.prototype._generateRdf = function (settings, data, metadata, done) {
  this._addDatasources(settings, data, metadata);
  done();
};

module.exports = ErrorRdfView;
