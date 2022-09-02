const express = require("express");
const app = express();
const path = require("path");

app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")));
app.get("/", (req, res) => {
  res.render("index", { title: "로그인" });
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기중`);
});
