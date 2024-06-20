const express = require("express");
const { title } = require("process");
const morgan = require("morgan");
const { deserialize } = require("v8");
const bodyParser = require("body-parser");

const passport = require("passport");
require("./passport");

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

// Connection_URI
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(morgan("common"));
app.use(express.static("public"));
app.use(bodyParser.json());

// CORS
const cors = require("cors");
let allowedOrigins = ["http://localhost:8080", "http://testsite.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message = "The CORS policy for this application doesn’t allow access from origin " + origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require("./auth")(app); // ensures that Express is available in 'auth.js' file

// READ (GET) - Return ALL movies. Uses Mongoose and Passport JWT authentication
app.get("/movies", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const movies = await Movies.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// READ (GET)- Return movies matching movie genre entered. Uses Mongoose and JWT authentication
app.get("/movies/genre/:genre", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { genre } = req.params;
    const movies = await Movies.find({ Genre });
    if (movies.length > 0) {
      res.status(200).json(movies);
    } else {
      res.status(404).send("No such genre");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// READ (GET) - Return a specific movie by title. Uses Mongoose and JWT authentication
app.get("/movies/title/:title", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { title } = req.params;
    const movie = await Movies.findOne({ Title: title });
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(404).send("No such movie");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// READ (GET) - Return the director's information. Uses Mongoose and JWT authentication
app.get("/movies/director/:director", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { director } = req.params;
    const movie = await Movies.findOne({ "Director.Name": director });
    if (movie) {
      res.status(200).json(movie.Director);
    } else {
      res.status(404).send("No such director");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// READ (Get) - all users. Uses Mongoose and JWT authentication
app.get("/users", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// READ (GET) - Return a user by name. Uses Mongoose and JWT authentication
app.get("/users/name/:name", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({ name: req.params.name }); // Fetch user by name
    if (user) {
      res.status(200).json(user); // Send the user as a JSON response
    } else {
      res.status(404).send("No such user");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// CREATE (POST)- Create a new user. Uses Mongoose
app.post("/users", async (req, res) => {
  try {
    const newUser = req.body;

    if (!newUser.Username) {
      return res.status(400).send("user needs a name");
    }
    // Creates and saves the user
    const user = await Users.create({
      Username: newUser.Username,
      Password: newUser.Password,
      Email: newUser.Email,
      BirthDate: newUser.BirthDate,
      FavoriteMovie: newUser.FavoriteMovie,
    });

    // Handles errors
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error; " + error);
  }
});

// CREATE (POST) - Add a new movie
app.post("/movies", (req, res) => {
  const newMovie = req.body;

  if (
    newMovie.Title &&
    newMovie.Description &&
    newMovie.Genre &&
    newMovie.Director &&
    newMovie.Director.Name &&
    newMovie.Director.Bio &&
    newMovie.Director.BirthDate &&
    newMovie.imageURL
  ) {
    movies.push(newMovie);
    res.status(201).json(newMovie);
  } else {
    res.status(400).send("Missing required movie details");
  }
});

// New port for using Heroku
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});

// Initial Mongoose connection
// mongoose.connect("mongodb://localhost:27017/test", { useNewUrlParser: true, useUnifiedTopology: true });

// Listen method, this starts a server listening for connection on port 8080
// app.listen(8080, () => {
//   console.log("Your app is running on port 8080.");
// });

// Old code

// Internal database
// const movies = [
//   {
//     Title: "Scarface",
//     Description: "A riveting drama about the rise and fall of a notorius drug dealer.",
//     Genre: "Drama",
//     // GenreID:1
//     Director: {
//       // DirectorID:1
//       Name: "Brian De Palma",
//       Bio: "Brian Russell De Palma is an American film director and screenwriter. With a career spanning over 50 years, he is best known for work in the suspense, crime and psychological thriller genres.",
//       BirthDate: "September 11, 1940",
//       DeathDate: "NA",
//     },
//     imageURL: "https://upload.wikimedia.org/wikipedia/en/7/71/Scarface_-_1983_film.jpg",
//     Featured: true,
//   },
//   {
//     Title: "Good Will Hunting",
//     Description:
//       "A touching tale of a young man who struggles to find his identity, living in a world where he can solve any problem, except the one brewing deep within himself.",
//     Genre: "Drama",
//     // GenreID:1
//     Director: {
//       // DIrectorID:2
//       Name: "Gus Van Sant",
//       Bio: "Gus Green Van Sant Jr. is an American film director, producer, photographer, and musician who has earned acclaim as an independent filmmaker.",
//       BirthDate: "July 24, 1952",
//       DeathDate: "NA",
//     },
//     imageURL: "https://upload.wikimedia.org/wikipedia/en/5/52/Good_Will_Hunting.png",
//     Featured: false,
//   },
//   {
//     Title: "Boiler Room",
//     Description:
//       "A college dropout, attempting to live up to his father's high standards, gets a job as a broker for a suburban investment firm which puts him on the fast track to success. But the job might not be as legitimate as it first appeared to be.",
//     Genre: "Drama",
//     // GenreID:1
//     Director: {
//       // DirectorID:3
//       Name: "Ben Younger",
//       Bio: "Younger became disenchanted with politics, and by 1995 started to seek a creative outlet that would rekindle the excitement he felt as a stand-up comedian. He wrote and directed a short film, as well as working on a number of feature films as a grip, and directing music videos and commercials.",
//       BirthDate: "October 7, 1972",
//       DeathDate: "NA",
//     },
//     imageURL: "https://upload.wikimedia.org/wikipedia/en/5/5c/Boiler_room_ver3.jpg",
//     Featured: false,
//   },
//   {
//     Title: "Zoolander",
//     Description: "At the end of his career, a clueless fashion model is brainwashed to kill the Prime Minister of Malaysia.",
//     Genre: "Comedy",
//     // GenreID:2
//     Director: {
//       // DirectorID:4
//       Name: "Ben Stiller",
//       Bio: "Benjamin Edward Meara Stiller is an American actor, filmmaker, and comedian.",
//       BirthDate: "November, 30, 1965",
//       DeathDate: "NA",
//     },
//     imageURL: "https://upload.wikimedia.org/wikipedia/en/7/7c/Movie_poster_zoolander.jpg",
//     Featured: false,
//   },
//   {
//     Title: "Star Wars Episode IV",
//     Description:
//       "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire's world-destroying battle station, while also attempting to rescue Princess Leia from the mysterious Darth Vader.",
//     Genre: "Science Fiction",
//     // GenreID:3
//     Director: {
//       // DirectorID:5
//       Name: "George Lucas",
//       Bio: "George Walton Lucas Jr.[1] (born May 14, 1944) is an American filmmaker and philanthropist. He created the Star Wars and Indiana Jones franchises and founded Lucasfilm, LucasArts, Industrial Light & Magic and THX.",
//       BirthDate: "May 14, 1944",
//       DeathDate: "NA",
//     },
//     imageURL: "https://upload.wikimedia.org/wikipedia/en/8/87/StarWarsMoviePoster1977.jpg",
//     Featured: false,
//   },
//   {
//     Title: "Lost in Translation",
//     Description: "A faded movie star and a neglected young woman form an unlikely bond after crossing paths in Tokyo.",
//     Genre: "Comedy",
//     // GenreID:2
//     Director: {
//       // DirectorID:6
//       Name: "Sofia Coppola",
//       Bio: "Sofia Carmina Coppola (/ˈkoʊpələ/ KOH-pəl-ə[1] Italian pronunciation: [soˈfiːa karˈmiːna ˈkoppola]; born May 14, 1971) is an American film director, screenwriter, producer, and former actress.",
//       BirthDate: "May 14, 1971",
//       DeathDate: "NA",
//     },
//     imageURL: "https://upload.wikimedia.org/wikipedia/en/4/4c/Lost_in_Translation_poster.jpg",
//     Featured: false,
//   },
//   {
//     Title: "Planes, Trains, and Automobiles",
//     Description:
//       "A Chicago advertising man must struggle to travel home from New York for Thanksgiving, with a lovable oaf of a shower-curtain-ring salesman as his only companion.",
//     Genre: "Comedy",
//     // GenreID:2
//     Director: {
//       // DirectorID:7
//       Name: "John Hughes",
//       Bio: "John Wilden Hughes Jr. was an American film director, producer and screenwriter.",
//       BirthDate: "February 18, 1950",
//       DeathDate: "August 6, 2009",
//     },
//     imageURL: "https://upload.wikimedia.org/wikipedia/en/d/d6/Planes_trains_and_automobiles.jpg",
//     Featured: false,
//   },
//   {
//     Title: "Forrest Gump",
//     Description:
//       "The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75, who yearns to be reunited with his childhood sweetheart.",
//     Genre: "Comedy",
//     // GenreID:2
//     Director: {
//       // DirectorID:8
//       Name: "Robert Zemeckis",
//       Bio: "Robert Lee Zemeckis (born May 14, 1952) is an American filmmaker. He first came to public attention as the director of the action-adventure romantic comedy Romancing the Stone, the science-fiction comedy Back to the Future trilogy, and the live-action/animated comedy Who Framed Roger Rabbit.",
//       BirthDate: "May 14, 1952",
//       DeathDate: "NA",
//     },
//     imageURL: "https://upload.wikimedia.org/wikipedia/en/6/67/Forrest_Gump_poster.jpg",
//     Featured: false,
//   },
//   {
//     Title: "Back to the Future",
//     Description:
//       "Marty McFly, a 17-year-old high school student, is accidentally sent 30 years into the past in a time-traveling DeLorean invented by his close friend, the maverick scientist Doc Brown.",
//     Genre: "Comedy",
//     // GenreID:2
//     Director: {
//       //  DirectorID:8
//       Name: "Robert Zemeckis",
//       Bio: "Robert Lee Zemeckis (born May 14, 1952) is an American filmmaker. He first came to public attention as the director of the action-adventure romantic comedy Romancing the Stone, the science-fiction comedy Back to the Future trilogy, and the live-action/animated comedy Who Framed Roger Rabbit.",
//       BirthDate: "May 14, 1952",
//       DeathDate: "NA",
//     },
//     imageURL: "https://upload.wikimedia.org/wikipedia/en/d/d2/Back_to_the_Future.jpg",
//     Featured: false,
//   },
//   {
//     Title: "My Cousin Vinny",
//     Description:
//       "Two New Yorkers accused of murder in rural Alabama while on their way back to college call in the help of one of their cousins, a loudmouth lawyer with no trial experience.",
//     Genre: "Comedy",
//     // GenreID:2
//     Director: {
//       //  DirectorID:9
//       Name: "Jonathan Lynn",
//       Bio: "Jonathan Adam Lynn is an English stage and film director, producer, writer, and actor. He directed the comedy films Clue, Nuns on the Run, My Cousin Vinny, and The Whole Nine Yards. ",
//       BirthDate: "April 3, 1943",
//       DeathDate: "NA",
//     },
//     imageURL: "https://upload.wikimedia.org/wikipedia/en/7/76/My-Cousin-Vinny-Poster.jpg",
//     Featured: false,
//   },
// ];

// READ (GET) - Return all movies
// app.get("/movies", (req, res) => {
//   res.status(200).json(movies);
// });

// EXPRESS JS Route Handlers

// READ (GET)- Return any movie that matches the genre entered (Comedy, Drama, Suspense, etc.)
// app.get("/movies/genre/:genre", (req, res) => {
//   const { genre } = req.params;
//   const movie = movies.filter((movie) => movie.Genre === genre);
//   if (movie) {
//     res.status(200).json(movie);
//   } else {
//     res.status(400).send("No such genre");
//   }
// });

// READ (GET) - Return a specific movie by title
// app.get("/movies/title/:title", (req, res) => {
//   const { title } = req.params;
//   const movie = movies.find((movie) => movie.Title === title);

//   if (movie) {
//     res.status(200).json(movie);
//   } else {
//     res.status(400).send("No such movie");
//   }
// });

// READ (GET)- Return the director's information
// app.get("/movies/director/:director", (req, res) => {
//   const { director } = req.params;
//   const movie = movies.find((movie) => movie.Director.Name === director);

//   if (movie) {
//     res.status(200).json(movie.Director);
//   } else {
//     res.status(400).send("No such director");
//   }
// });

// READ (GET) - Return all users
// app.get("/users", async (req, res) => {
//   try {
//     const users = await Users.find(); // Fetch all users from the Users collection
//     res.status(200).json(users); // Send the users as a JSON response
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error: " + error);
//   }
// });

// get request/response
// app.get("/movies", (req, res) => {
//   res.send(topMovies);
// });

// get request at "/" (the root level)
// app.get("/", (req, res) => {
//   res.send("Welcome to the movie_api project");
// });

// error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

// let users = [];

// const uuid = require("uuid");
