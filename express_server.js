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
    console.log(user);
    if (email === usersDb[user].email){
      return true;
  }
}

};

function getUserFromCookie (req) {
  var username = null;
  var email = null;
  if (usersDb[req.cookies['userId']]) {
    email = usersDb[req.cookies['userId']].email;
    username = usersDb[req.cookies['userId'].username];
  }
  return {username, email};
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
  console.log(req.cookies['userId']);

  let templateVars = { urls: urlDatabase, ...getUserFromCookie(req)};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {...getUserFromCookie(req)}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], ...getUserFromCookie(req)};
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
  res.redirect("/urls/");
});


app.post("/login", (req, res) => {
  if (email === "" || password === "" ) {
    res.status(400).send('Give us your info!');
  }
  // res.status(400).json(json_response);
  else if (verifyIfEmailExists(email)) {
    res.status(400).send("This email is already registered.");
  } else { 
    console.log("Email doesn't exist");
    const newUser = { id: userID, email: email, password: password};
    usersDb[userID] = newUser;
    console.log('UserDb: ', usersDb);

      //set cookie's userID to randomID instead of username
    res.cookie("userId", userID);
    res.redirect("/urls");

  }
});

app.get("/login", (req, res) => {
  if (email === "" || password === "" ) {
    res.status(400).send('Give us your info!');
  }
  // res.status(400).json(json_response);
  else if (verifyIfEmailExists(email)) {
    res.status(400).send("This email is already registered.");
  } else { 
      console.log("Email doesn't exist");
      const newUser = { id: userID, email: email, password: password};
      usersDb[userID] = newUser;
      console.log('UserDb: ', usersDb);

      //set cookie's userID to randomID instead of username
      res.cookie("userId", userID);
    }

  res.cookie('user', req.body.username);;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/urls");
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
        res.redirect("/urls");

      }
    });