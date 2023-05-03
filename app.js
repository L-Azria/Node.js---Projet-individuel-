import mysql from "mysql2";
import express from "express";
const app = express();

app.use(express.urlencoded({ extended: true }));

/// PARTIE CONNEXION
//création d'un pool de connection : gère les connection avec la BD
const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "Linhl@n02052015",
  database: "pizzeria",
  waitForConnections: true,
  connectionLimit: 10,
  // port par défaut utilisé : non nécessaire de le préciser
});

const promisePool = pool.promise();
// La connexion à la base est établie

//fonction : permet d'accéder aux données à volonté
async function listPizzas() {
  const [rows] = await promisePool.execute("select * from pizzas");
  // console.log(rows);
  return rows;
}
// creer de nouveeaux pizzas
async function newPizza(
  code,
  libelle,
  ingredients,
  categorie,
  prix,
  version_pizza
) {
  const [rows] = await promisePool.execute(
    "insert into pizzas (code, libelle, ingredients, categorie, prix,version_pizza) values(?,?,?,?,?,?)",
    [code, libelle, ingredients, categorie, prix, version_pizza]
  );
  return rows;
}

// PARTIE WEB
//démarrage du serveur
const port = 6001;
app.listen(port, () => {
  console.log(`App is runnning on port ${port}`);
});

//configuration du moteur de vue
app.set("views", "./views");
app.set("view engine", "pug");
// dossier public visible
app.use("/public", express.static("public"));

//page utilisateurs
app.get("/admin/users", async (req, res) => {
  res.render("ad-users");
});

//page pizzas
app.get("/admin/pizzas", async (req, res) => {
  const allPizzas = await listPizzas();
  console.log(allPizzas);
  res.render("ad-pizzas", { pizzas: allPizzas });
});

//page creer une pizza
app.get("/admin/pizzas/creer", async (req, res) => {
  const allPizzas = await listPizzas();
  console.log(allPizzas);
  res.render("ad-pizzas-creer", { pizzas: allPizzas });
});

//récuperer la requête de création d'une pizza
app.post("/admin/pizzas/creer", async (req, res) => {
  const newPizzaCode = req.body.code;
  const newPizzaLibelle = req.body.libelle;
  const newPizzaIngredients = req.body.ingredients;
  const newPizzaCategorie = req.body.categorie;
  const newPizzaPrix = req.body.prix;
  const newPizzaVersion = req.body.version;
  const PizzaAdded = await newPizza(
    newPizzaCode,
    newPizzaLibelle,
    newPizzaIngredients,
    newPizzaCategorie,
    newPizzaPrix,
    newPizzaVersion
  );
  console.log(`newPizza`);
  res.redirect("/admin/pizzas");
});
