const express = require("express");
const app = express();
const path = require("path");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const dotenv = require("dotenv").config();
app.use(
  session({
    secret: "codenumber",
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "userID",
      passwordField: "userPW",
      session: true,
      passReqToCallback: false,
    },
    (id, password, done) => {
      console.log(id, "====", password);
      db.collection("member").findOne({ userID: id }, (err, result) => {
        if (err) {
          return done(err);
        }
        if (!result) {
          return done(null, false, { message: "존재하지 않는 아이디 입니다." });
        }
        if (result) {
          if (password === result.userPW) {
            console.log("로그인 성공");
            return done(null, result);
          } else {
            console.log("로그인 실패");
            return done(null, false, { message: "password를 확인해주세요." });
          }
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user, userID);
});
passport.deserializeUser((id, done) => {
  db.collection("member").findOne({ userID: id }, (err, result) => {
    done(null, result);
  });
});

const MongoClient = require("mongodb").MongoClient;
let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
  }
  db = client.db("seoul");
});

app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.render("index", { title: "로그인", userInfo: req.user });
});
app.get("/register", (req, res) => {
  res.send(`아이디는 ${req.query.userID}==패스워드는 ${req.query.userPW}`);
});
app.post("/registerAjax", (req, res) => {
  const userID = req.body.userID;
  const userPW = req.body.userPW;
  console.log(userID);
  console.log(userPW);
  db.collection("member").insertOne({ userID: userID, userPW: userPW }, (err, result) => {
    if (err) {
      console.log(err);
      res.send(`<script>alert("알 수 없는 오류로 회원가입이 되지 않았습니다. 잠시후 다시 가입해 주세요"); location.href="/"</script>`);
    }
    res.json({ isJoin: true });
  });
});
app.get("/logout", (req, res) => {
  if (req.user) {
    req.session.destroy();
    //res.redirect("/");
    res.send(`<script>alert("로그아웃되었습니다."); location.href="/"</script>`);
  }
});
app.post("/login", passport.authenticate("local", { failureRedirect: "/login", successRedirect: "/" }));
app.post("/register", (req, res) => {
  const userID = req.body.userID;
  const userPW = req.body.userPW;
  const userName = req.body.userName;
  console.log(userID);
  console.log(userPW);
  console.log(userName);
  const insertData = {
    userID: userID,
    userPW: userPW,
    userName: userName,
  };
  db.collection("member").insertOne(insertData, (err, result) => {
    if (err) {
      console.log(err);
      res.send(`<script>alert("알 수 없는 오류로 회원가입이 되지 않았습니다. 잠시후 다시 가입해 주세요"); location.href="/"</script>`);
    }
    //res.redirect("/login");
    res.send(`<script>alert("회원가입이 잘 되었습니다.");location.href="/"</script>`);
    //res.render("registerSuccess", { title: "success" });
    // res.redirect("/success");
  });
  //res.send(`아이디는 ${req.body.userID}==패스워드는 ${req.body.userPW}`);
});

app.post("/idCheck", (req, res) => {
  const userID = req.body.userID;
  db.collection("member").findOne({ userID: userID }, (err, result) => {
    //console.log(result);
    if (result === null) {
      res.json({ isOk: true });
    } else {
      res.json({ isOk: false });
    }
  });
});
app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기중`);
});
