app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")));
app.use("/upload", express.static(path.join(__dirname, "/upload")));
