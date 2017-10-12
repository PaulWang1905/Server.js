# Linked Data Fragments Server
<img src="http://linkeddatafragments.org/images/logo.svg" width="200" align="right" alt="" />

[![Build Status](https://travis-ci.org/LinkedDataFragments/Server.js.svg?branch=master)](https://travis-ci.org/LinkedDataFragments/Server.js)
[![npm version](https://badge.fury.io/js/ldf-server.svg)](https://www.npmjs.com/package/ldf-server)
[![Docker Automated Build](https://img.shields.io/docker/automated/linkeddatafragments/server.js.svg)](https://hub.docker.com/r/linkeddatafragments/server.js/)
[![DOI](https://zenodo.org/badge/16891600.svg)](https://zenodo.org/badge/latestdoi/16891600)

On today's Web, Linked Data is published in different ways,
which include [data dumps](http://downloads.dbpedia.org/3.9/en/),
[subject pages](http://dbpedia.org/page/Linked_data),
and [results of SPARQL queries](http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=CONSTRUCT+%7B+%3Fp+a+dbpedia-owl%3AArtist+%7D%0D%0AWHERE+%7B+%3Fp+a+dbpedia-owl%3AArtist+%7D&format=text%2Fturtle).
We call each such part a [**Linked Data Fragment**](http://linkeddatafragments.org/).

The issue with the current Linked Data Fragments
is that they are either so powerful that their servers suffer from low availability rates
([as is the case with SPARQL](http://sw.deri.org/~aidanh/docs/epmonitorISWC.pdf)),
or either don't allow efficient querying.

Instead, this server offers **[Triple Pattern Fragments](http://www.hydra-cg.com/spec/latest/triple-pattern-fragments/)**.
Each Triple Pattern Fragment offers:

- **data** that corresponds to a _triple pattern_
  _([example](http://data.linkeddatafragments.org/dbpedia?subject=&predicate=rdf%3Atype&object=dbpedia-owl%3ARestaurant))_.
- **metadata** that consists of the (approximate) total triple count
  _([example](http://data.linkeddatafragments.org/dbpedia?subject=&predicate=rdf%3Atype&object=))_.
- **controls** that lead to all other fragments of the same dataset
  _([example](http://data.linkeddatafragments.org/dbpedia?subject=&predicate=&object=%22John%22%40en))_.

An example server is available at [data.linkeddatafragments.org](http://data.linkeddatafragments.org/).


## Install the server

This server requires [Node.js](http://nodejs.org/) 4.0 or higher
and is tested on OSX and Linux.
To install, execute:
```bash
$ [sudo] npm install -g ldf-server
```


## Use the server

### Configure the data sources

First, create a [JSON-LD](https://json-ld.org/) configuration file `config.json` similar to `config/config-example.json`,
in which you detail your data sources.
For example, this configuration uses an [HDT file](http://www.rdfhdt.org/)
and a [SPARQL endpoint](http://www.w3.org/TR/sparql11-protocol/) as sources:
```json
{
  "@context": [
    "https://linkedsoftwaredependencies.org/contexts/@ldf/server-datasource-hdt.jsonld",
    "https://linkedsoftwaredependencies.org/contexts/@ldf/server-datasource-sparql.jsonld"
  ],
  "@id": "urn:ldfserver:my",
  "@type": "QpfServer",
  "title": "My Linked Data Fragments server",
  "datasources": [
    { "@id": "ldfs:defaultIndexDatasource" },
    {
      "@id": "ex:myHdtDatasource",
      "@type": "HdtDatasource",
      "title": "DBpedia 2014",
      "description": "DBpedia 2014 with an HDT back-end",
      "path": "dbpedia",
      "hdtFile": "data/dbpedia2014.hdt"
    },
    {
      "@id": "ex:mySparqlDatasource",
      "@type": "SparqlDatasource",
      "title": "DBpedia 3.9 (Virtuoso)",
      "description": "DBpedia 3.9 with a Virtuoso back-end",
      "path": "dbpedia-sparql",
      "sparqlEndpoint": "http://dbpedia.restdesc.org/"
    }
  ],
}
```

The following sources can be used by installing external plugins,
which requires importing of their respective context to use the JSON-LD shortcut terms:
- HDT files ([`HdtDatasource`](https://github.com/LinkedDataFragments/server-datasource-hdt/blob/master/lib/datasources/HdtDatasource.js) with `file` setting)
- N-Triples documents ([`NTriplesDatasource`](https://github.com/LinkedDataFragments/server-datasource-n3/blob/master/lib/datasources/NTriplesDatasource.js) with `url` setting)
- Turtle documents ([`TurtleDatasource`](https://github.com/LinkedDataFragments/server-datasource-n3/blob/master/lib/datasources/TurtleDatasource.js) with `url` setting)
- N-Quads documents ([`NQuadsDatasource`](https://github.com/LinkedDataFragments/server-datasource-n3/blob/master/lib/datasources/NQuadsDatasource.js) with `url` setting)
- TriG documents ([`TrigDatasource`](https://github.com/LinkedDataFragments/server-datasource-n3/blob/master/lib/datasources/TrigDatasource.js) with `url` setting)
- JSON-LD documents ([`JsonLdDatasource`](https://github.com/LinkedDataFragments/server-datasource-jsonld/blob/master/lib/datasources/JsonLdDatasource.js) with `url` setting)
- SPARQL endpoints ([`SparqlDatasource`](https://github.com/LinkedDataFragments/server-datasource-sparql/blob/master/lib/datasources/SparqlDatasource.js) with `endpoint` setting)
- [and more...](https://www.npmjs.com/org/ldf)

Support for new sources is possible by implementing the [`Datasource`](https://github.com/LinkedDataFragments/Server.js/blob/master/lib/datasources/Datasource.js) interface.

### Start the server

After creating a configuration file, execute
```bash
$ ldf-server config.json 5000 4
```
Here, `5000` is the HTTP port on which the server will listen,
and `4` the number of worker processes.

Now visit `http://localhost:5000/` in your browser.

### Reload running server

You can reload the server without any downtime
in order to load a new configuration or version.
<br>
In order to do this, you need the process ID of the server master process.
<br>
One possibility to obtain this are the server logs:
```bash
$ bin/ldf-server config.json
Master 28106 running.
Worker 28107 running on http://localhost:3000/ (URL: /).
```

If you send the server a `SIGHUP` signal:
```bash
$ kill -s SIGHUP 28106
```
it will reload by replacing its workers.

Note that crashed or killed workers are always replaced automatically.

### _(Optional)_ Installing plugins

The modular nature of the server allows external components to be plugged in using the config file.
In general, 4 types of plugin components exist:
* Datasources: Holding data
* Controllers: Handling HTTP(S) requests
* Routers: Extracting query parameters
* Views: Returning HTML or RDF responses.

Plugins (such as `@ldf/server-datasource-n3`) can be installed in two different ways:
1. If the server was install globally (with `-g`),
plugins should also be installed globally: `$ [sudo] npm install -g @ldf/server-datasource-n3`
2. If the server was installed as a local module (without `-g`),
plugins should also be installed locally: `$ npm install @ldf/server-datasource-n3`

After installation, the plugin's context can be used inside your config file
for allowing its JSON-LD terminology to be used
The N3 datasource plugin for example introduces the `TurtleDatasource` and `url` terms,
which can be used as follows:
```json
{
  "@context": [
    "https://linkedsoftwaredependencies.org/contexts/@ldf/server-datasource-n3.jsonld"
  ],
  …
  "datasources": [
    …
    {
      "@id": "ex:myTtlDatasource",
      "@type": "TurtleDatasource",
      "title": "My Turtle Datasource",
      "path": "my-ttl",
      "url": "file:path/to/file.ttl"
    }
  ],
}
```

All available plugins can be found on [NPM](https://www.npmjs.com/org/ldf).

**important:** If you clone this repository, plugins can not be installed directly inside the server's modules.
Either the server and the plugins must be installed as part of a (virtual) module,
or they must all be available as global modules.

### _(Optional)_ Set up a reverse proxy

A typical Linked Data Fragments server will be exposed
on a public domain or subdomain along with other applications.
Therefore, you need to configure the server to run behind an HTTP reverse proxy.
<br>
To set this up, configure the server's public URL in your server's `config.json`:
```json
{
  …
  "baseURL": "http://data.example.org/",
  …
}
```
Then configure your reverse proxy to pass requests to your server.
Here's an example for [nginx](http://nginx.org/):
```nginx
server {
  server_name data.example.org;

  location / {
    proxy_pass http://127.0.0.1:3000$request_uri;
    proxy_set_header Host $http_host;
    proxy_pass_header Server;
  }
}
```
Change the value `3000` into the port on which your Linked Data Fragments server runs.

If you would like to proxy the data in a subfolder such as `http://example.org/my/data`,
modify the `baseURL` in your `config.json` to `"http://example.org/my/data"`
and change `location` from `/` to `/my/data` (excluding a trailing slash).

### _(Optional)_ Running in a Docker container

If you want to rapidly deploy the server as a microservice, you can build a [Docker](https://www.docker.com/) container as follows:

```bash
$ docker build -t ldf-server .
```
After that, you can run your newly created container:
```bash
$ docker run -p 3000:3000 -t -i --rm -v $(pwd)/config.json:/tmp/config.json ldf-server /tmp/config.json
```

### _(Optional)_ Host historical version of datasets

You can [enable the Memento protocol](https://github.com/LinkedDataFragments/Server.js/wiki/Configuring-Memento) to offer different versions of an evolving dataset.

## License
The Linked Data Fragments client is written by [Ruben Verborgh](http://ruben.verborgh.org/) and colleagues.

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).
