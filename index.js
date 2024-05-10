const express = require("express");
const { title } = require("process");

const app = express();

app.use(morgan("common"));

let topMovies = [
  {
    title: "Scarface",
  },
  {
    title: "Goodwill Hunting",
  },
  {
    title: "Boiler Room",
  },
  {
    title: "Zoolander",
  },
  {
    title: "Star Wars",
  },
  {
    title: "Lost in Translation",
  },
  {
    title: "Planes, Trains, and Automobiles",
  },
  {
    title: "Forest Gump",
  },
  {
    title: "One Flew Over The Cuckoo's Nest ",
  },
  {
    title: "The Harder They Come",
  },
];

// Get requests
app.get("/movies", (req, res) => {
  res.send("Welcome to some of my favorite movies!");
});

app.get("documentation", (req, res) => {
  res.sendFile("public/documentation.html", {
    root: __dirname,
  });
});

// first get request
app.get("/movies", (req, res) => {
  res.send(topMovies);
});

// second get request at "/" (the root level)
app.get("/", (req, res) => {
  res.send("Welcome to the movie_api project");
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Listen method, this starts a server listening for connection on port 8080
app.listen(8080, () => {
  console.log("Your app is running on port 8080.");
});
