/*! @license MIT ©2014-2016 Ruben Verborgh, Ghent University - imec */
var N3Datasource = require('../../').datasources.N3Datasource;

var Datasource = require('@ldf/core').datasources.Datasource,
    path = require('path');

var exampleTurtleUrl = 'file://' + path.join(__dirname, '../../../../test/assets/test.ttl');

describe('N3Datasource', function () {
  describe('The N3Datasource module', function () {
    it('should be a function', function () {
      N3Datasource.should.be.a('function');
    });

    it('should be a N3Datasource constructor', function (done) {
      var instance = new N3Datasource({ url: exampleTurtleUrl });
      instance.should.be.an.instanceof(N3Datasource);
      instance.close(done);
    });

    it('should create Datasource objects', function (done) {
      var instance = new N3Datasource({ url: exampleTurtleUrl });
      instance.should.be.an.instanceof(Datasource);
      instance.close(done);
    });
  });

  describe('A N3Datasource instance for an example Turtle file', function () {
    var datasource = new N3Datasource({ url: exampleTurtleUrl });
    datasource.initialize();
    after(function (done) { datasource.close(done); });

    itShouldExecute(datasource,
      'the empty query',
      { features: { triplePattern: true } },
      132, 132);

    itShouldExecute(datasource,
      'the empty query with a limit',
      { limit: 10, features: { triplePattern: true, limit: true } },
      10, 132);

    itShouldExecute(datasource,
      'the empty query with an offset',
      { offset: 10, features: { triplePattern: true, offset: true } },
      122, 132);

    itShouldExecute(datasource,
      'a query for an existing subject',
      { subject: 'http://example.org/s1',   limit: 10, features: { triplePattern: true, limit: true } },
      10, 100);

    itShouldExecute(datasource,
      'a query for a non-existing subject',
      { subject: 'http://example.org/p1',   limit: 10, features: { triplePattern: true, limit: true } },
      0, 0);

    itShouldExecute(datasource,
      'a query for an existing predicate',
      { predicate: 'http://example.org/p1', limit: 10, features: { triplePattern: true, limit: true } },
      10, 110);

    itShouldExecute(datasource,
      'a query for a non-existing predicate',
      { predicate: 'http://example.org/s1', limit: 10, features: { triplePattern: true, limit: true } },
      0, 0);

    itShouldExecute(datasource,
      'a query for an existing object',
      { object: 'http://example.org/o001',  limit: 10, features: { triplePattern: true, limit: true } },
      3, 3);

    itShouldExecute(datasource,
      'a query for a non-existing object',
      { object: 'http://example.org/s1',    limit: 10, features: { triplePattern: true, limit: true } },
      0, 0);
  });
});

function itShouldExecute(datasource, name, query, expectedResultsCount, expectedTotalCount) {
  describe('executing ' + name, function () {
    var resultsCount = 0, totalCount;
    before(function (done) {
      var result = datasource.select(query);
      result.getProperty('metadata', function (metadata) { totalCount = metadata.totalCount; });
      result.on('data', function (triple) { resultsCount++; });
      result.on('end', done);
    });

    it('should return the expected number of triples', function () {
      expect(resultsCount).to.equal(expectedResultsCount);
    });

    it('should emit the expected total number of triples', function () {
      expect(totalCount).to.equal(expectedTotalCount);
    });
  });
}