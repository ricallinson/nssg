# Getting Started

## Prerequisites

You will need [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed to use `nssg`.

## Installation

Using [npm](https://www.npmjs.com/) run the following command.
It is recommended to install `nssg` globally as it is a command line tool.

```
npm i -g nssg
```

## First Project

Running the following command will create a project directory named `./example` with default configurations and templates.

```
nssg init -d example
```

The project can then be *built* with the following command.

```
nssg build -d example
```

This generates HTML files in the directory `./example/build`.
Any time you make a change to a project file, run `nssg build -d example` to regenerate the site.

Alternatively use the `preview` command which launches a local web-server on *http://localhost:5000* and watches for changes to the project files.

```
nssg preview -d example
```

Any new files added or updates to files in the project directory will automatically trigger the `build` command.
