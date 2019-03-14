var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};  

app.get("/", (req, res) => {
  res.send("Hello!");
});
//listening to app portal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//display object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//display the message on the HTML page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["user"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["user"]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["user"]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  //res.send(urlDatabase);      
  res.redirect(`/urls/${shortURL}`); 
});

app.get("/u/:shortURL", (req, res) => {
  console.log("TEST")
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls/");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = 
  console.log('update');
  res.redirect("/urls/");
});


app.post("/login", (req, res) => {
  res.cookie('user', req.body.username);;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/urls");
})
 