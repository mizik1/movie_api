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

// These websites are allowed and bypass CORS
let allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8080",
  "http://testsite.com",
  "https://mycoolflixreactapp.netlify.app",
];

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

// JWT middleware authentication
const requireAuth = passport.authenticate("jwt", { session: false });

// READ (GET) - Return ALL movies. Uses Mongoose and Passport JWT authentication
app.get("/movies", requireAuth, async (req, res) => {
  try {
    const movies = await Movies.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// READ (GET)- Return movies matching movie genre entered. Uses Mongoose and JWT authentication
app.get("/movies/genre/:genre", requireAuth, async (req, res) => {
  try {
    const { genre } = req.params;
    console.log(`Querying for genre: ${genre}`); // Log the genre being queried
    const movies = await Movies.find({ Genre: { $regex: new RegExp(genre, "i") } });
    console.log(`Movies found: ${movies.length}`); // Log the number of movies found
    if (movies.length > 0) {
      res.status(200).json(movies); // Return the array of movies
    } else {
      res.status(404).send("No such genre");
    }
  } catch (error) {
    console.error("Error querying movies by genre:", error);
    res.status(500).send("Error: " + error);
  }
});

// READ (GET) - Return a specific movie by title. Uses Mongoose and JWT authentication
app.get("/movies/title/:title", requireAuth, async (req, res) => {
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
app.get("/movies/director/:director", requireAuth, async (req, res) => {
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
    const user = await Users.findOne({ Username: req.params.name }); // Fetch user by name
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

// CREATE (POST)- Create a new user. Uses Mongoose and JWT authentication
app.post("/users", async (req, res) => {
  try {
    const newUser = req.body;

    if (!newUser.Username || !newUser.Password || !newUser.Email) {
      return res.status(400).send("Missing required user details");
    }

    const hashedPassword = await Users.hashPassword(newUser.Password); // Use Users
    // Creates and saves the user
    const user = await Users.create({
      Username: newUser.Username,
      Password: hashedPassword,
      Email: newUser.Email,
      BirthDate: newUser.BirthDate,
      FavoriteMovies: newUser.FavoriteMovies,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// CREATE (POST) - Adding a movie to a user's favorite. Uses Mongoose and JWT authentication
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

    // Add movie to user's favorites if it's not already added
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

// CREATE (POST) - Adds a new movie with JWT authentication
app.post("/movies", passport.authenticate("jwt", { session: false }), async (req, res) => {
  const { Title, Description, Genre, Director, imageURL, Featured } = req.body;

  // Validate required fields
  if (!Title || !Description || !Genre || !Director || !Director.Name || !Director.Bio || !imageURL) {
    return res.status(400).send("Missing required movie details");
  }

  try {
    // Create new movie object with 'imageURL' field instead of 'ImagePath'
    const movie = new Movies({
      Title,
      Description,
      Genre,
      Director: {
        Name: Director.Name,
        Bio: Director.Bio,
        BirthDate: Director.BirthDate || null, // Allow optional BirthDate
      },
      imageURL, // Ensure the correct field name is used here
      Featured: Featured || false, // Default to false if not provided
    });

    // Save the movie to the database
    const savedMovie = await movie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    console.error("Error creating movie:", error);
    res.status(500).send("Error: " + error);
  }
});

// DELETE (DELETE) - Remove a movie from user's favorite. Uses Mongoose and JWT authentication
app.delete("/users/:userId/favorites/:movieId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { userId, movieId } = req.params;

    // Find the user by ID
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if the movie is in the user's favorites
    const favoriteIndex = user.FavoriteMovies.indexOf(movieId);
    if (favoriteIndex > -1) {
      user.FavoriteMovies.splice(favoriteIndex, 1); // Remove the movie from favorites
      await user.save(); // Save the updated user document
      res.status(200).json(user); // Return the updated user document
    } else {
      res.status(404).send("Movie not found in favorites");
    }
  } catch (error) {
    console.error("Error removing favorite movie:", error);
    res.status(500).send("Error: " + error);
  }
});

// DELETE - Delete a user. Uses Mongoose and JWT authentication
app.delete("/users/:userId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Delete the user
    await Users.findByIdAndDelete(userId);
    res.status(200).send("User with ID {$userID} has been deleted.");
  } catch (error) {
    console.error("Error removing user:", error);
    res.status(500).send("Error: " + error);
  }
});

// Non hardcoded port for using Heroku.
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
