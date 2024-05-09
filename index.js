const express = require("express");
const { title } = require("process");

const app = express();

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
  res.send("Welcome to my favorite movies!");
});

app.get("documentation", (req, res) => {
  res.sendFile("public/documentation.html", {
    root: __dirname,
  });
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});
