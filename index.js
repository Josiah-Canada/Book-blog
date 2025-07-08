import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import fs from "fs";

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT):3000
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const thoughtBubble = [];
const essays = [];
const year = new Date().getFullYear();



app.get("/", (req, res) => {
  res.render("index.ejs", {
    thoughtBubble: thoughtBubble,
    Year: year,
  });
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/create", (req, res) => {
  res.render("create.ejs", { essays: essays});
});

app.get("/essays", (req, res) => {
  res.render("essays.ejs", { essays: essays });
});

app.post("/create", (req, res) => {
  const { title, content } = req.body;
  const fileName = `${title.toLowerCase().replace(/\s/g, "-")}.ejs`;

  fs.writeFile(
    `views/pages/${fileName}`,
    `<%- include("../partials/header") %> <h1><%= title %> </h1><p><%= content %> </p> <%- include("../partials/footer") %>`,
    (err) => {
      if (err) {
        console.error("Error creating file:", err);
        return res.status(500).send("Error creating page");
      }
      console.log(`File '${fileName}' created successfully`);

      essays.push({ title, fileName });

      app.get(`/${title.toLowerCase().replace(/\s/g, "-")}`, (req, res) => {
        res.render(`pages/${fileName}`, { title, content });
      });

      res.redirect("/essays");
    }
  );
});

app.post("/submit", (req, res) => {
  const thoughts = req.body["thoughts"];
  console.log(thoughts);
  if (thoughts) {
    thoughtBubble.push(thoughts);
  }
  res.redirect("/");
});

app.delete("/delete/:index", (req, res) => {
  const index = req.params.index;
  thoughtBubble.splice(index, 1);
  console.log("post deleted");
  res.redirect("/");
});

app.put("/put/:index", (req, res) => {
  const newThought = req.body["_method"];
  const index = req.params.index;
  thoughtBubble.splice(index, 1, newThought);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
