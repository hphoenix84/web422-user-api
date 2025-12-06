const express = require('express');
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
dotenv.config();

const userService = require("./user-service.js");
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
}

app.post("/api/user/register", (req, res) => {
  userService.registerUser(req.body)
    .then((msg) => {
      res.json({ "message": msg });
    }).catch((msg) => {
      res.status(422).json({ "message": msg });
    });
});

app.post("/api/user/login", (req, res) => {
  userService.checkUser(req.body)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id, userName: user.userName },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ 
        "message": "login successful",
        "token": token,
        "userName": user.userName
      });
    }).catch(msg => {
      res.status(422).json({ "message": msg });
    });
});

app.get("/api/user/favourites", verifyToken, (req, res) => {
  userService.getFavourites(req.user._id)
    .then(data => {
      res.json(data);
    }).catch(msg => {
      res.status(422).json({ error: msg });
    })
});

app.put("/api/user/favourites/:id", verifyToken, (req, res) => {
  userService.addFavourite(req.user._id, req.params.id)
    .then(data => {
      res.json(data)
    }).catch(msg => {
      res.status(422).json({ error: msg });
    })
});

app.delete("/api/user/favourites/:id", verifyToken, (req, res) => {
  userService.removeFavourite(req.user._id, req.params.id)
    .then(data => {
      res.json(data)
    }).catch(msg => {
      res.status(422).json({ error: msg });
    })
});

module.exports = app;