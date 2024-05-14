const express = require("express");
const { title } = require("process");
const morgan = require("morgan");
const { deserialize } = require("v8");

const app = express();

app.use(morgan("common"));
app.use(express.static("public"));

let topMovies = [
  {
    Title: "Scarface",
  },
  {
    Title: "Good Will Hunting",
  },
  {
    Title: "Boiler Room",
  },
  {
    Title: "Zoolander",
  },
  {
    Title: "Star Wars Episode IV",
  },
  {
    Title: "Lost in Translation",
  },
  {
    Title: "Planes, Trains, and Automobiles",
  },
  {
    Title: "Forrest Gump",
  },
  {
    Title: "The Thing",
  },
  {
    Title: "My Cousin Vinny",
  },
];

const movies = [
  {
    Title: "Scarface",
    Description: "A riveting drama about the rise and fall of a notorius drug dealer.",
    Genre: "suspense",
    Director: "Brian De Palma",
  },
  {
    Title: "Good Will Hunting",
    Description:
      "A touching tale of a young man who struggles to find his identity, living in a world where he can solve any problem, except the one brewing deep within himself.",
    Genre: "drama",
    Director: "Brian De Palma",
  },
  {
    Title: "Boiler Room",
    Description:
      "A college dropout, attempting to live up to his father's high standards, gets a job as a broker for a suburban investment firm which puts him on the fast track to success. But the job might not be as legitimate as it first appeared to be.",
    Genre: "drama",
    Director: "Ben Younger",
  },
  {
    Title: "Zoolander",
    Description: "At the end of his career, a clueless fashion model is brainwashed to kill the Prime Minister of Malaysia.",
    Genre: "comedy",
    Director: "Ben Stiller",
  },
  {
    Title: "Star Wars Episode IV",
    Description:
      "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire's world-destroying battle station, while also attempting to rescue Princess Leia from the mysterious Darth Vader.",
    Genre: "sci-fi",
    Director: "George Lucas",
  },
  {
    Title: "Lost in Translation",
    Description: "A faded movie star and a neglected young woman form an unlikely bond after crossing paths in Tokyo.",
    Genre: "drama",
    Director: "Sofia Coppola",
  },
  {
    Title: "Planes, Trains, and Automobiles",
    Description:
      "A Chicago advertising man must struggle to travel home from New York for Thanksgiving, with a lovable oaf of a shower-curtain-ring salesman as his only companion.",
    Genre: "comedy",
    Director: "John Hughes",
  },
  {
    Title: "Forrest Gump",
    Description:
      "The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75, who yearns to be reunited with his childhood sweetheart.",
    Genre: "comedy drama",
    Director: "Robert Zemeckis",
  },
  {
    Title: "The Thing",
    Description: "A research team in Antarctica is hunted by a shape-shifting alien that assumes the appearance of its victims.",
    Genre: "horror",
    Director: "John Carpenter",
  },
  {
    Title: "My Cousin Vinny",
    Description:
      "Two New Yorkers accused of murder in rural Alabama while on their way back to college call in the help of one of their cousins, a loudmouth lawyer with no trial experience.",
    Genre: "comedy",
    Director: "Jonathan Lynn",
  },
];

// READ request to get all movies
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

// READ request to get single movie by title
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("No such movie");
  }
});

// Continue adding more endpoint code requests here

// get request/response
app.get("/movies", (req, res) => {
  res.send(topMovies);
});

// get request at "/" (the root level)
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
