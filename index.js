const express = require("express");
const { title } = require("process");
const morgan = require("morgan");
const { deserialize } = require("v8");

const app = express();

app.use(morgan("common"));
app.use(express.static("public"));

const movies = [
  {
    Title: "Scarface",
    Description: "A riveting drama about the rise and fall of a notorius drug dealer.",
    Genre: "Suspense",
    Director: {
      Name: "Brian De Palma",
      Bio: "Brian Russell De Palma is an American film director and screenwriter. With a career spanning over 50 years, he is best known for work in the suspense, crime and psychological thriller genres.",
      BirthDate: "September 11, 1940",
      DeathDate: "NA",
    },
  },
  {
    Title: "Good Will Hunting",
    Description:
      "A touching tale of a young man who struggles to find his identity, living in a world where he can solve any problem, except the one brewing deep within himself.",
    Genre: "Drama",
    Director: {
      Name: "Gus Van Sant",
      Bio: "Gus Green Van Sant Jr. is an American film director, producer, photographer, and musician who has earned acclaim as an independent filmmaker.",
      BirthDate: "July 24, 1952",
      DeathDate: "NA",
    },
  },
  {
    Title: "Boiler Room",
    Description:
      "A college dropout, attempting to live up to his father's high standards, gets a job as a broker for a suburban investment firm which puts him on the fast track to success. But the job might not be as legitimate as it first appeared to be.",
    Genre: "Drama",
    Director: {
      Name: "Ben Younger",
      Bio: "Younger became disenchanted with politics, and by 1995 started to seek a creative outlet that would rekindle the excitement he felt as a stand-up comedian. He wrote and directed a short film, as well as working on a number of feature films as a grip, and directing music videos and commercials.",
      BirthDate: "October 7, 1972",
      DeathDate: "NA",
    },
  },
  {
    Title: "Zoolander",
    Description: "At the end of his career, a clueless fashion model is brainwashed to kill the Prime Minister of Malaysia.",
    Genre: "Comedy",
    Director: {
      Name: "Ben Stiller",
      Bio: "Benjamin Edward Meara Stiller is an American actor, filmmaker, and comedian.",
      BirthDate: "November, 30, 1965",
      DeathDate: "NA",
    },
  },
  {
    Title: "Star Wars Episode IV",
    Description:
      "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire's world-destroying battle station, while also attempting to rescue Princess Leia from the mysterious Darth Vader.",
    Genre: "Sci-fi",
    Director: {
      Name: "George Lucas",
      Bio: "George Walton Lucas Jr.[1] (born May 14, 1944) is an American filmmaker and philanthropist. He created the Star Wars and Indiana Jones franchises and founded Lucasfilm, LucasArts, Industrial Light & Magic and THX.",
      BirthDate: "May 14, 1944",
      DeathDate: "NA",
    },
  },
  {
    Title: "Lost in Translation",
    Description: "A faded movie star and a neglected young woman form an unlikely bond after crossing paths in Tokyo.",
    Genre: "Drama",
    Director: {
      Name: "Sofia Coppola",
      Bio: "Sofia Carmina Coppola (/ˈkoʊpələ/ KOH-pəl-ə[1] Italian pronunciation: [soˈfiːa karˈmiːna ˈkoppola]; born May 14, 1971) is an American film director, screenwriter, producer, and former actress.",
      BirthDate: "May 14, 1971",
      DeathDate: "NA",
    },
  },
  {
    Title: "Planes, Trains, and Automobiles",
    Description:
      "A Chicago advertising man must struggle to travel home from New York for Thanksgiving, with a lovable oaf of a shower-curtain-ring salesman as his only companion.",
    Genre: "Comedy",
    Director: {
      Name: "John Hughes",
      Bio: "John Wilden Hughes Jr. was an American film director, producer and screenwriter.",
      BirthDate: "February 18, 1950",
      DeathDate: "August 6, 2009",
    },
  },
  {
    Title: "Forrest Gump",
    Description:
      "The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75, who yearns to be reunited with his childhood sweetheart.",
    Genre: "Comedy",
    Director: {
      Name: "Robert Zemeckis",
      Bio: "Robert Lee Zemeckis (born May 14, 1952) is an American filmmaker. He first came to public attention as the director of the action-adventure romantic comedy Romancing the Stone, the science-fiction comedy Back to the Future trilogy, and the live-action/animated comedy Who Framed Roger Rabbit.",
      BirthDate: "May 14, 1952",
      DeathDate: "NA",
    },
  },
  {
    Title: "The Thing",
    Description: "A research team in Antarctica is hunted by a shape-shifting alien that assumes the appearance of its victims.",
    Genre: "Horror",
    Director: {
      Name: "John Carpenter",
      Bio: "John Howard Carpenter is an American filmmaker, composer, and actor. Most commonly associated with horror, action, and science fiction films of the 1970s and 1980s, he is generally recognized as a master of the horror genre.",
      BirthDate: "January 16, 1948",
      DeathDate: "NA",
    },
  },
  {
    Title: "My Cousin Vinny",
    Description:
      "Two New Yorkers accused of murder in rural Alabama while on their way back to college call in the help of one of their cousins, a loudmouth lawyer with no trial experience.",
    Genre: "Comedy",
    Director: {
      Name: "Jonathan Lynn",
      Bio: "Jonathan Adam Lynn is an English stage and film director, producer, writer, and actor. He directed the comedy films Clue, Nuns on the Run, My Cousin Vinny, and The Whole Nine Yards. ",
      BirthDate: "April 3, 1943",
      DeathDate: "NA",
    },
  },
];

// READ - Return all movies
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

// READ - Return a specific movie by title
app.get("/movies/title/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("No such movie");
  }
});

// READ - Return any movie that matches the genre entered (Comedy, Drama, Suspense, etc.)
app.get("/movies/genre/:genre", (req, res) => {
  const { genre } = req.params;
  const movie = movies.filter((movie) => movie.Genre === genre);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("No such genre");
  }
});

// READ - Return the director's name
app.get("/movies/director/:director", (req, res) => {
  const { director } = req.params;
  const directors = movies.filter((movie) => movie.Director.Name === director);

  if (directors) {
    res.status(200).json(directors);
  } else {
    res.status(400).send("No such director");
  }
});

// READ - Return director's name and bio

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
