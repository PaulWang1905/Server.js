# Linked Data Fragments Server - WebID
<img src="http://linkeddatafragments.org/images/logo.svg" width="200" align="right" alt="" />

This module adds a controller extension that only allows authenticated client with WebID's to perform requests.
This extension will only be active when the server is running in [https-mode](https://github.com/LinkedDataFragments/Server.js/wiki/WebID-authentication).

This package is **not** included by default in `@ldf/server-qpf` and `@ldf/preset-qpf`.

## Usage in other packages

When this module is used in a package`,
then the JSON-LD context `https://linkedsoftwaredependencies.org/contexts/@ldf/feature-webid.jsonld` must be imported.

This package exposes the following config entries:
* `WebIdControllerExtension`: Extends Quad Pattern Fragments responses with WebID authentication. _Should be used as `@type` value._

Next to adding the WebID controller extension, you must enable HTTPS-mode, as shown in the example below.

For example:
```
{
  "@context": [
    "https://linkedsoftwaredependencies.org/bundles/npm/@ldf/core/^3.0.0/components/context.jsonld",
    "https://linkedsoftwaredependencies.org/bundles/npm/@ldf/preset-qpf/^3.0.0/components/context.jsonld",
    "https://linkedsoftwaredependencies.org/bundles/npm/@ldf/feature-webid/^3.0.0/components/context.jsonld",
  ],
  "@id": "urn:ldf-server:my",
  "import": "preset-qpf:config-defaults.json",

  "controllers": [
    {
      "@id": "ex:myQuadPatternFragmentsController", // This should refer to your existing QuadPatternFragmentsController
      "@type": "QuadPatternFragmentsController",
      "qpfControllerExtension": {
        "@id": "ex:myWebIdControllerExtension",
        "@type": "WebIdControllerExtension"
      }
    }
  ],

  "protocol": "https"
}
```

## License
The Linked Data Fragments server is written by [Ruben Verborgh](http://ruben.verborgh.org/) and colleagues.

This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).