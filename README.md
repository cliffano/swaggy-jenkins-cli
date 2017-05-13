<img align="right" src="https://raw.github.com/cliffano/swaggy-jenkins-cli/master/avatar.jpg" alt="Avatar"/>

[![Build Status](https://img.shields.io/travis/cliffano/swaggy-jenkins-cli.svg)](http://travis-ci.org/cliffano/swaggy-jenkins-cli)
[![Dependencies Status](https://img.shields.io/david/cliffano/swaggy-jenkins-cli.svg)](http://david-dm.org/cliffano/swaggy-jenkins-cli)
[![Coverage Status](https://img.shields.io/coveralls/cliffano/swaggy-jenkins-cli.svg)](https://coveralls.io/r/cliffano/swaggy-jenkins-cli?branch=master)
[![Published Version](https://img.shields.io/npm/v/swaggy-jenkins-cli.svg)](http://www.npmjs.com/package/swaggy-jenkins-cli)
<br/>
[![npm Badge](https://nodei.co/npm/swaggy-jenkins-cli.png)](http://npmjs.org/package/swaggy-jenkins-cli)

Swaggy Jenkins CLI
------------------

Swaggy Jenkins CLI is a utility tool for [Swaggy Jenkins](http://github.com/cliffano/swaggy-jenkins) library.

It's handy for generating OpenAPI definitions YAML from a set of Jenkins response JSON files.

Installation
------------

    npm install -g swaggy-jenkins-cli

Usage
-----

Generate OpenAPI definitions YAML from a set of [Jenkins Remote Access API](https://wiki.jenkins-ci.org/display/JENKINS/Remote+access+API) response JSON files under a directory:

    swaggy-jenkins response2definition examples/responses/ --api-type remote-access

Generate definitions from a single response JSON file and write the output to both console and file:

    swaggy-jenkins response2definition examples/responses/getComputer.json --api-type remote-access --reporter console,file --out-file examples/definitions.yml

Colophon
--------

[Developer's Guide](http://cliffano.github.io/developers_guide.html#nodejs)

Build reports:

* [Code complexity report](http://cliffano.github.io/swaggy-jenkins-cli/complexity/plato/index.html)
* [Unit tests report](http://cliffano.github.io/swaggy-jenkins-cli/test/buster.out)
* [Test coverage report](http://cliffano.github.io/swaggy-jenkins-cli/coverage/buster-istanbul/lcov-report/lib/index.html)
* [Integration tests report](http://cliffano.github.io/swaggy-jenkins-cli/test-integration/cmdt.out)
* [API Documentation](http://cliffano.github.io/swaggy-jenkins-cli/doc/dox-foundation/index.html)

Related Projects:

* [swaggy-jenkins](http://github.com/cliffano/swaggy-jenkins) - Generated Jenkins API clients based on OpenAPI spec
* [swaggy-c](http://github.com/cliffano/swaggy-c) - Builder for Swagger CodeGen-generated API clients in multiple languages
