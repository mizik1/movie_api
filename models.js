const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: { type: String, required: true }, // Genre is a string
  Director: {
    Name: { type: String, required: true },
    Bio: { type: String, required: true },
  },
  Actors: [String],
  imageURL: { type: String, required: true }, // Changed this field from ImagePath to imageURL
  Featured: Boolean,
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

// Pre-save middleware to hash password
userSchema.pre("save", function (next) {
  let user = this;

  if (!user.isModified("Password")) return next();

  bcrypt.hash(user.Password, 10, (err, hash) => {
    if (err) return next(err);
    user.Password = hash;
    next();
  });
});

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
