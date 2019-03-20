var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

var cookieSession = require('cookie-session');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}))
app.set("view engine", "ejs");

const bcrypt = require('bcrypt');

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};

const verifyIfEmailExists = function (email) {
  for (var user in usersDb) { 
    if (email === usersDb[user].email){
      return usersDb[user];
    }
  }
};

function urlsForUser(id) {
  let userURLs = {};
  for (var skim in urlDatabase) {
    console.log("Something: " + urlDatabase[skim]);
    console.log(id);
    if (id === urlDatabase[skim]['userID']) {
      userURLs[skim] = urlDatabase[skim];
    }
  }  
  return userURLs;
};

// function getUserFromCookie (req) {
//   var username = null;
//   var email = null;
//   var userRecord;
//   console.log('db: ', usersDb)
//   if (usersDb[req.session['userId']]) {
//     userRecord = usersDb[req.session['userId']]
//     email = userRecord.email;
//   }
//   console.log('getting user: ', userRecord);

//   //return userRecord;
// }

var urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"}
};  

var usersDb =  {
  "userRandomID": {
    id: "userRandomID", 
    username: "placeholder1",
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    username: "placeholder2",
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
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
  if(req.session['userId'] === undefined) {
    res.redirect('/login');
  }
  let templateVars = { urls: urlsForUser(req.session['userId']), user: usersDb[req.session.userId]};
  console.log("Template " + templateVars.user, req.session.userId);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session['userId']) {
    let templateVars = {user: usersDb[req.session.userId]}
    res.render("urls_new", templateVars);
  } else {
      res.redirect("/login");
  }

});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session['userId']) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: usersDb[req.session.userId]};
    res.render("urls_show", templateVars);
  } else {
      res.status(400).send("You need to log in!");
  }
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const user = usersDb[req.session.userId];
  const shortURL = generateRandomString();
  if (user) {
    urlDatabase[shortURL] = {longURL: longURL, userID: user.id};
    res.redirect(`/urls/${shortURL}`);
  } else {
      res.status(400).send("You need to log in!");
  }
});
//NOT SURE WHAT THIS (BELOW) IS FOR... 
// app.get("/u/:shortURL", (req, res) => {
//   const longURL = urlDatabase[req.params.shortURL].longURL;
//   res.redirect(longURL);
// });

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = usersDb[req.session.userId];
  const shortURL = req.params.shortURL;
  console.log("Test: " + user.id);
  if (user && user.id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  } else {
      res.redirect("/login");
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const user = usersDb[req.session.userId];
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = {longURL: longURL, userID: user.id};
  res.redirect("/urls/");
});

app.get("/login", (req, res) => {
  let templateVars = {user: usersDb[req.session.userId]}
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const oldUser = verifyIfEmailExists(email)
  if (email === "" || password === "" ) {
    res.status(400).send('Give us your info!');
  }
  // res.status(400).json(json_response);
  else if (oldUser && bcrypt.compareSync(password, oldUser.password)){
      //set cookie's userID to randomID instead of username
    req.session["userId"] = oldUser.id;
    res.redirect("/urls")
    console.log("PASS:" + password);
  } else {
      res.status(400).send('Give us your info! Wrong input!');
    }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
 
app.get("/register", (req, res) => {
  let templateVars = {user: usersDb[req.session.userId]}
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password; // found in the req.params object
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "" ) {
    res.status(400).send('Give us your info!');
  } else if (verifyIfEmailExists(email)) {
      res.status(400).send("This email is already registered.");
    } else { 
        console.log("Email doesn't exist");
        const newUser = { id: userID, email: email, password: hashedPassword};
        usersDb[userID] = newUser;
        console.log('UserDb: ', usersDb);
        //set cookie's userID to randomID instead of username
        req.session["userId"] = userID;
        res.redirect("/urls");
      }
    });