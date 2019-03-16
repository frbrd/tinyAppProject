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

const verifyIfEmailExists = function (email) {
  for (var user in usersDb) { 
    if (email === usersDb[user].email){
      return usersDb[user];
    }
}

};

function getUserFromCookie (req) {
  var username = null;
  var email = null;
  var userRecord;
  console.log('db: ', usersDb)
  if (usersDb[req.cookies['userId']]) {
    userRecord = usersDb[req.cookies['userId']]
    email = userRecord.email;
  }
  console.log('getting user: ', userRecord)

  return userRecord;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  console.log('jim: ',req.cookies['userId']);
  let templateVars = { urls: urlDatabase, user: getUserFromCookie(req)};
  console.log('asdasd: ',templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: getUserFromCookie(req)}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: getUserFromCookie(req)};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userId = getUserFromCookie(req)
  const shortURL = generateRandomString();
  //urlDatabase[shortURL] = {longURL: longURL, userId: userId};
  //res.send(urlDatabase);    
  // if (userId) {
  //   urlDatabase[shortURL] = {longURL: longURL, userId: userId};
  //   res.redirect("/urls/");
  // }  else {
  //   res.redirect("/login");
  // }
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
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/");
});

app.get("/login", (req, res) => {
  let templateVars = {user: getUserFromCookie(req)}
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
  else if (oldUser) {
      //set cookie's userID to randomID instead of username
      res.cookie("userId", oldUser.id);
      res.redirect("/urls")
    }

  // res.cookie('user', req.body.username);;
  // res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/urls");
});
 
app.get("/register", (req, res) => {
  let templateVars = {user: getUserFromCookie(req)}
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
    if (email === "" || password === "" ) {
      res.status(400).send('Give us your info!');
    }
    else if (verifyIfEmailExists(email)) {
      res.status(400).send("This email is already registered.");
    } else { 
        console.log("Email doesn't exist");
        const newUser = { id: userID, email: email, password: password};
        usersDb[userID] = newUser;
        console.log('UserDb: ', usersDb);

        //set cookie's userID to randomID instead of username
        res.cookie("userId", userID);
        console.log('Jimmy: ',newUser.id);
        res.redirect("/urls");

      }
    });