const express = require("express");
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb");
//init app & middleware
const app = express();
app.use(express.json());
//db connection
let db;

connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log("app listening on port 3000");
    });
    db = getDb();
  }
});

//routes
app.get("/books", (req, res) => {
  //current page
  const page = req.query.p || 0;
  const booksPerPage = 3;

  let books = [];

  db.collection("books")
    .find() //return cursor toArray foreach
    .sort({ author: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch(() => {
      res.status(500).json({ error: "Could noy fetch the documents" });
    });
  // res.json({ mssg: "welcome to the app" });
});

app.get("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .findOne({ _id: new ObjectId(req.params.id) })
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json({ error: "Could not fetch the docs" });
      });
  } else {
    res.status(500).json({ error: "Not valid document id" });
  }
});

//post request

app.post("/books", (req, res) => {
  const book = req.body;
  db.collection("books")
    .insertOne(book)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Could not create a new document" });
    });
});

//deleting request
app.delete("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: "Could not delete the doc" });
      });
  } else {
    res.status(500).json({ error: "Not valid document id" });
  }
});

//patch request for update things

app.patch("/books/:id", (req, res) => {
  const updates = req.body;
  // {"title":"new value", ""}
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: "Could not update the doc" });
      });
  } else {
    res.status(500).json({ error: "Not valid document id" });
  }
});

// var mergeAlternately = function (word1, word2) {
//   let ans = "";
//   for (let i = 0; i < Math.min(word1.length, word2.length); i++) {
//     ans += word1[i] + word2[i];
//   }
//   if (word2.length > word1.length) {
//     ans += word2.slice(word1.length);
//   } else {
//     ans += word1.slice(word2.length);
//   }
//   return ans;
// };
// console.log("hello");

// console.log(mergeAlternately("abc", "qwertyu"));
