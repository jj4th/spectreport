[![Build Status](https://travis-ci.org/jj4th/spectreport.svg?branch=master)](https://travis-ci.org/jj4th/spectreport) [![Coverage Status](https://coveralls.io/repos/github/jj4th/spectreport/badge.svg?branch=master)](https://coveralls.io/github/jj4th/spectreport?branch=master) [![devDependency Status](https://david-dm.org/jj4th/spectreport/dev-status.svg)](https://david-dm.org/jj4th/spectreport#info=devDependencies)

Spectreport
===========

A generator for nice HTML test reports.

## Usage ##
Usage information and instructions, including a list of built-in plugins, can be obtained from the spectreport cli help option:

```shell
$ npm install -g spectreport
$ spectreport -h
```

Information about the built-in plugins and their options can be obtained by:

```shell
$ spectreport -u plugin-name
```

## Generating Test Results ##
In order to run Spectreport, you'll need some test results!  The easiest way to get these is to use the appropriate reporter plugin for your test runner.  This project currently maintains plugins for the following test runners:

| Runner | Reporter |
| --- | --- |
| Mocha <br> [http://mochajs.org](http://mochajs.org/) | Mocha-Spectreport-Reporter <br> [https://git.io/v2WaG](https://git.io/v2WaG) |



