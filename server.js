// Create server instance

const express = require("express");
const app = express();



const path = require("path");
const cors = require("cors");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.get("/", (request, response) => {
  response.send("Hello World!");
});


// Handle Cross Origin Resource Sharing(CORS)

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})


app.use(express.json())
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 
}

app.use('/api', cors(corsOptions));


app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self' data:;"); // Set CSP header
  next();
});


// Create Database Connection with Server

const dbPath = path.join(__dirname, "bookDatabase.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3008, () => {
      console.log("Server Running at http://localhost:3008/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


// Handle getbooks API HTTP request

app.get("/getbooks/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      book_id,book_title,book_author
    FROM
      bookdetails;`;
  const booksArray = await db.all(getBooksQuery);
  //console.log('books',booksArray)
  response.send(booksArray);
});

// Handle getbookdetails API HTTP request

app.post("/getbooks/:id/", async (request, response) => {
  //console.log('request body',request.params)
  const {id} = request.params
  const getBooksQuery = `
    SELECT
      book_description
    FROM
      bookdetails
      WHERE book_id = ${id}`;
  const booksArray = await db.all(getBooksQuery);
  //console.log('books',booksArray)
  response.send(booksArray);
});

// Handle booksCount API HTTP request

app.get("/getbookscount/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      COUNT() as bookscount
    FROM
      bookdetails;`;
  const booksArray = await db.all(getBooksQuery);
  console.log('books',booksArray)
  response.send(booksArray[0]);
});


// Handle addbook API HTTP request

app.post("/addbook/", async (request, response) => {
  const bookDetails = request.body;
  console.log(bookDetails);
  const {
    book_id,
    book_title,
    book_author,
    published,
    book_description,
  } = bookDetails;
  
  const addBookQuery = `
    INSERT INTO bookdetails (book_id, book_title, book_author, published, book_description)
    VALUES (?, ?, ?, ?, ?);`;
  
  const values = [book_id, book_title, book_author, published, book_description];
  
  try {
    await db.run(addBookQuery, values);
    response.sendStatus(200);
  } catch (error) {
    console.error('Error adding book:', error);
    response.sendStatus(500);
  }
});
