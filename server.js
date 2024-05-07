const http = require("http");
const url = require("url");
const fs = require("fs");

const server = http.createServer((request, response) => {
  parseUrl = url.parse(request.url, true);
  const path = parseUrl.pathname;

  // log the request file to the log.txt file
  const logEntry = `${new Date().toISOString()} - ${request.url}\n`;
  fs.appendFile("log.txt", logEntry, (err) => {
    if (err) console.error("Error:", err);
  });

  // check if url has the word "documentation"
  if (path.includes("documentation")) {
    // if it is present show 'documentation.html'
    fs.readFile("documentation.html", (err, data) => {
      if (err) {
        response.writeHead(404, { "Content-Type": "text/html" });
        return response.end("error");
      }
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(data);
      return response.end();
    });
  } else {
    // if 'documentation' is not present, show 'index.html'
    fs.readFile("index.html", (err, data) => {
      if (err) {
        response.writeHead(404, { "Content-Type": "text/html" });
        return response.end("error");
      }
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(data);
      return response.end();
    });
  }
});
server.listen(8080, () => {
  console.log("My test server is running on Port 8080!");
});
