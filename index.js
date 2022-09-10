const express = require("express");
const app = express();
const path = require("path");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const dotenv = require("dotenv").config();
const cloudinary = require("cloudinary");
const multer = require("multer");
const { nextTick } = require("process");
app.use(
  session({
    secret: "codenumber",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60, secure: false },
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
  done(null, user.userID);
});
passport.deserializeUser((id, done) => {
  db.collection("member").findOne({ userID: id }, (err, result) => {
    done(null, result);
    if (err) {
      console.log(err);
    }
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
app.use("/upload", express.static(path.join(__dirname, "/upload")));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({});

const fileUpload01 = multer({ storage: storage });
const fileUpload02 = multer({ storage: storage });

app.get("/login", (req, res) => {
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
    req.session.destroy(function (err) {
      res.send(`<script>alert("로그아웃되었습니다."); location.href="/login"</script>`);
    });
  } else {
    res.send(`<script>alert("서버가 끊겼습니다."); location.href="/login"</script>`);
  }
});
app.get("/main", (req, res) => {
  if (req.user) {
    db.collection("list")
      .find()
      .toArray((err, result) => {
        res.render("main", { title: "Seoul Photography List", main: result });
      });
  } else {
    res.send(`<script>alert("서버가 끊겼습니다."); location.href="/login"</script>`);
  }
});

app.get("/mypage", (req, res) => {
  // console.log(req.user.userID);
  if (req.user) {
    res.render("mypage", { title: "My Page", userInfo: req.user });
  } else {
    res.send(`<script>alert("서버가 끊겼습니다."); location.href="/login"</script>`);
  }
});
app.post("/mypage", (req, res) => {
  const userID = req.body.userID;
  const userPW = req.body.userPW;
  const userName = req.body.userName;

  db.collection("member").updateOne({ userID: userID }, { $set: { userID: userID, userPW: userPW, userName: userName } }, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.log(result);
    res.send(`<script>alert("회원정보 수정이 되었습니다.");location.href="/login";</script>`);
  });
});
app.get("/detail/:title", (req, res) => {
  const title = req.params.title;
  db.collection("list").findOne({ title: title }, (err, result) => {
    // if (result) {
    //   res.render("detail", { title: "detail", data: result });
    // }
    if (err) {
      console.log(err);
    }
  });
});
app.post("/detail:edit", (req, res) => {
  const title = req.body.title;
  const date = req.body.date;
  const desc = req.body.desc;
  const point = req.body.point;
  const insert = {
    title: title,
    date: date,
    desc: desc,
    point: point,
  };
  console.log(req);
  db.collection("list").updateOne(insert);
  console.log(insert);

  // db.collection("list").updateOne({ $set: { title: title, date: date, desc: desc, point: point } }, (err, result) => {
  //   if (err) {
  //     console.log(err);
  //   }
  //   console.log(result);
  //   res.send(`<script>alert("회원정보 수정이 되었습니다.");location.href="/login";</script>`);
  // });
});

app.post("/login", passport.authenticate("local", { failureRedirect: "/login", successRedirect: "/main" }));

app.get("/delete", (req, res) => {
  res.render("delete", { title: "Member Delete" });
});
app.post("/delete", (req, res) => {
  if (req.user) {
    console.log(req.user.userID);
    const userPW = req.body.userPW;
    db.collection("member").deleteOne({ userID: req.user.userID, userPW: userPW }, (err, result) => {
      console.log(result);
      if (result.deletedCount > 0) {
        res.send(`<script>alert("회원탈퇴 되었습니다.");location.href="/login"</script>`);
      } else {
        res.send(`<script>alert("비밀번호 확인해주세요.");location.href="/delete";</script>`);
      }
    });
  } else {
    res.send(`<script>alert("서버가 끊겼습니다."); location.href="/login"</script>`);
  }
});

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

    res.send(`<script>alert("회원가입이 잘 되었습니다.");location.href="/"</script>`);
  });
});
app.post("/library", fileUpload01.single("image"), (req, res) => {
  db.collection("counter").findOne({ name: "total" }, (err, result) => {
    const title = req.body.title;
    const date = req.body.date;
    const desc = req.body.desc;
    const point = req.body.point;
    const image = req.file.filename;
    const total = result.totalPost;
    cloudinary.uploader.upload(req.file.path, (result) => {
      db.collection("list").insertOne({
        title: title,
        no: total + 1,
        image: result.url,
        point: point,
        desc: desc,
        date: date,
      });
      db.collection("counter").updateOne({ name: "total" }, { $inc: { totalPost: 1 } }, (err, result) => {
        if (err) {
          console.log(err);
        }
      });
    });
    res.send(`<script>alert("게시물이 완성되었습니다."); location.href="/main"</script>`);
  });
});
app.post("/summerNoteInsertImg", fileUpload02.single("summerNoteImg"), (req, res) => {
  console.log(req);
  cloudinary.uploader.upload(req.file.path, (result) => {
    res.json({ cloudinaryImgSrc: result.url });
  });
});
// app.get("/fileDelete", (req, res) => {
//   if (req.user) {
//     const title = req.body.title;
//     const date = req.body.date;
//     const desc = req.body.desc;
//     const point = req.body.point;
//     const image = req.body.image;
//     const insertData = {
//       title: title,
//       date: date,
//       desc: desc,
//       point: point,
//       image: image,
//     };
//     console.log(insertData);
//     db.collection("list").deleteOne(insertData, (err, result) => {
//       if (err) {
//         console.log(err);
//       }
//     });
//   }
// });
app.get("/write", (req, res) => {
  if (req.user) {
    res.render("write", { title: "Write" });
  } else {
    res.send(`<script>alert("서버가 끊겼습니다."); location.href="/login"</script>`);
  }
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
