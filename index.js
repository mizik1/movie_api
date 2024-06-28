require("dotenv").config();
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

// Heroku Connection_URI
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
    console.log(`Querying for genre: ${genre}`); // Log the genre being queried
    const movies = await Movies.findOne({ Genre: genre });
    console.log(`Movies found: ${movies.length}`); // Log the number of movies found
    if (movies.length > 0) {
      res.status(200).json(movies.Genre);
    } else {
      res.status(404).send("No such genre");
    }
  } catch (error) {
    console.error("Error querying movies by genre:", error);
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

// CREATE (POST)- Create a new user. Uses Mongoose and JWT
app.post("/users", async (req, res) => {
  try {
    const newUser = req.body;

    if (!newUser.Username || !newUser.Password || !newUser.Email) {
      return res.status(400).send("Missing required user details");
    }

    const hashedPassword = Users.hashPassword(newUser.Password); //Use Users
    // Creates and saves the user
    const user = await Users.create({
      Username: newUser.Username,
      Password: newUser.Password,
      Email: newUser.Email,
      BirthDate: newUser.BirthDate,
      FavoriteMovie: newUser.FavoriteMovie,
    });

    // CREATE (POST) - Adding a movie to a user's favorite
    app.post("/users/:userId/favorites/:movieId", passport.authenticate("jwt", { session: false }), async (req, res) => {
      try {
        const { userId, movieId } = req.params;

        // Find the user by ID
        const user = await Users.findById(userId);
        if (!user) {
          return res.status(404).send("User not found");
        }

        // Check if the movie exists
        const movie = await Movies.findById(movieId);
        if (!movie) {
          return res.status(404).send("Movie not found");
        }

        // Add movie to user's favorites if its not already added
        if (!user.FavoriteMovies.includes(movieId)) {
          user.FavoriteMovies.push(movieId);
          await user.save();
          return res.status(200).json(user);
        } else {
          return res.status(400).send("Movie already in favorites");
        }
      } catch (error) {
        console.error("Error adding favorite movie:", error);
        res.status(500).send("Error: " + error);
      }
    });
    // Handles errors
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error; " + error);
  }
});

// DELETE (DELETE) - Remove a movie from user's favorite
app.delete("users/:userID/favorites/:movieID", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { userId, movieId } = req.params;

    // find the user by ID
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if the movie is in the user's favorites
    user.FavoriteMovies.splice(favoriteIndex, 1);
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Error removing favorite movie;", error);
    res.status(500).send("Error: " + error);
  }
});

// CREATE (POST) - Adds a new movie with JWT authentication
app.post("/movies", passport.authenticate("jwt", { session: false }), async (req, res) => {
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
    try {
      // Add a new movie using the Movie model
      const movie = new Movie({
        Title: newMovie.Title,
        Description: newMovie.Description,
        Genre: newMovie.Genre,
        Director: {
          Name: newMovie.Director.Name,
          Bio: newMovie.Director.Bio,
          BirthDate: newMovie.Director.BirthDate,
        },
        ImagePath: newMovie.imageURL,
        Featured: newMovie.Featured || false,
      });

      // Save the movie to the database
      await movie.save();
      res.status(201).json(movie);
    } catch (error) {
      console.error("Error creating movie:", error);
      res.status(500).send("Error: " + error);
    }
  } else {
    res.status(400).send("Missing required movie details");
  }
});

// DELETE

// Non hardcoded port for using Heroku.
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
