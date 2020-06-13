## Installation

From the command line:
1. In the <code>/app</code> folder, run <code>npm install</code>
2. In the <code>/app/web</code> folder, run <code>npm install</code>
3. Add the contents of <code>/controller-scripts</code> into your Controller Scripts folder

## Running the Application From Source

1. In the <code>/app</code> folder, start the Node.js server with <code>node .</code>
2. Open <code>10.0.0.2:8080/web/index.html</code> in a web browser; a log message will be printed to the terminal when you are connected

## Packaging as a Standalone

1. Install pkg using <code>npm install -g pkg</code>
2. To package for mac, run <code>pkg . --targets node13-macos-x64</code>

## Running as a Standalone

In the <code>/app</code> folder, run <code>./remotewig</code>