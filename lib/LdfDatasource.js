/*! @license ©2013 Ruben Verborgh - Multimedia Lab / iMinds / Ghent University */

/** An LdfDatasource fetches fragments from a Triple Pattern Fragments server. */

var Datasource = require('./Datasource'),
    N3 = require('n3'),
    UriTemplate = require('uritemplate');

var hydra = 'http://www.w3.org/ns/hydra/core#',
    VoID = 'http://rdfs.org/ns/void#';
var countPredicate = VoID + 'triples';

// Creates a new LdfDatasource for the given endpoint
function LdfDatasource(fragmentTemplate, itemsPerPage) {
  // At the moment, we assume that the server follows a specific template
  // with subject, predicate, object, and page.
  // This is not hypermedia-driven, as it assumes a stronger contract
  // than a Triple Pattern Fragments server needs to provide.
  // Furthermore, we also assume a specific paging mechanism.
  // This should be updated in future implementations.
  this._fragmentTemplate = UriTemplate.parse(fragmentTemplate);
  this._itemsPerPage = itemsPerPage || 100;
}

LdfDatasource.prototype = {
  // Queries the fragment for the given triple pattern
  _query: function (pattern, offset, limit, addTriple, setCount, done) {
    // At the moment, runtime paging is not supported
    if (limit !== this._itemsPerPage)
      throw new Error('The paging of the target data source should be identical.');
    // Fetch the fragment
    pattern.page = Math.floor(offset / this._itemsPerPage) + 1;
    var fragmentUrl = this._fragmentTemplate.expand(pattern),
        fragment = this.request({ url: fragmentUrl, headers: { accept: 'text/turtle' }}, done),
        filter = this.tripleFilter(pattern), metadataFilter = metadataTriplesFilter(fragmentUrl);
    fragment.on('response', function (response) {
      // If successful, parse the fragment body
      if (response.statusCode < 300 || (response.statusCode === 404 && offset > 0)) {
        response.errorHandled = true;
        new N3.Parser().parse(fragment, function (error, triple) {
          if (!triple)
            return done(error);
          // If the count triple is found, emit the count value
          if (triple.subject === fragmentUrl && triple.predicate === countPredicate)
            setCount(parseInt(N3.Util.getLiteralValue(triple.object), 10));
          // Emit those triples that match the pattern
          if (addTriple && filter(triple) && !metadataFilter(triple))
            addTriple(triple);
        });
      }
      // If not found, there are no triples matching the pattern
      else if (response.statusCode === 404) {
        response.errorHandled = true;
        setCount(0), done();
      }
    });
  },
};
Datasource.extend(LdfDatasource);

// Tries to filter fragment metadata for clarity.
// With some triple pattern selectors, such as { ?s ?p ?o },
// the pattern does not allow to separate a fragment's data from its metadata.
// Therefore, the filter below tries to separate the metadata through known properties
// (even though technically, the data can be considered part of the fragment).
function metadataTriplesFilter(fragmentUrl) {
  return function (triple) {
    return triple.subject === fragmentUrl ||
           triple.predicate.indexOf(hydra) === 0 || triple.object.indexOf(hydra) === 0 ||
           triple.predicate.indexOf(VoID)  === 0 || triple.object.indexOf(VoID)  === 0;
  };
}

module.exports = LdfDatasource;