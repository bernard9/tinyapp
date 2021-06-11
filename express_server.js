const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "a@b.com",
    password: "a"
  },
};

const cookieParser = require('cookie-parser');
//Generates 6 character random string
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};
const urlsForUser = (id) => {
  let userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id]};
  if (req.cookies.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/", (req, res) => {
  res.redirect("urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.cookies.user_id), user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_login", templateVars);
});

// create new user
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Bad Request");
  }
  for (const user in users) {
    if (users[user].email === email) {
      return res.status(400).send("Bad Request");
    }
  }
  const newUser = users[userID] = {
    id: userID,
    email,
    password
  };
  users[userID] = newUser;
  console.log(users);
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect("/urls/${shortUrl}");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.cookies.user_id) {
    return res.redirect("/login");
  }
  if (req.cookies.user_id === urlDatabase[shortURL].userID) {
    console.log(urlDatabase[shortURL].userID);
    console.log(req.cookies.user_id);
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  } else {
    return res.status("404").send('bad request');
  }
});

app.post("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let foundUser;
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      foundUser = user;
    }
  }
  if (!foundUser) {
    return res.status(403).send('could not find user');
  }
  if (foundUser.password !== password) {
    return res.status(403).send('password is not correct');
  }
  res.cookie("user_id", foundUser.id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

