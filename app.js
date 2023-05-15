import mysql from "mysql2";
import express from "express";
import bcrypt from "bcrypt";
const saltRounds = 10;
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

//PIZZAS

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

// editer une pizza
async function editPizza(
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
}

//supprimer une pizza
async function deletePizza(id) {
  const [row] = await promisePool.execute("delete from pizzas where id=?", [
    id,
  ]);
}

//LIVREURS

//fonction : permet d'accéder aux données des livreurs à volonté
async function listLivreurs() {
  const [rows] = await promisePool.execute("select * from livreurs");
  // console.log(rows);
  return rows;
}
// creer de nouveaux livreurs
async function newLivreur(nom, prenom) {
  const [rows] = await promisePool.execute(
    "insert into livreurs (nom, prenom) values(?,?)",
    [nom, prenom]
  );
  return rows;
}

// editer un livreur
async function editLivreur(id, nom, prenom) {
  const [rows] = await promisePool.execute(
    "UPDATE livreurs SET nom=?, prenom=? where id=?",
    [nom, prenom, id]
  );
}

//supprimer un livreur
async function deleteLivreur(id) {
  const [row] = await promisePool.execute("delete from livreurs where id=?", [
    id,
  ]);
}

//CLIENTS

//fonction : permet d'accéder aux données à volonté
async function listClients() {
  const [rows] = await promisePool.execute(
    "select cl.*, ad.adresse, ad.id as ad_id from clients as cl LEFT JOIN clients_adresses as ca ON cl.id = ca.clients_id LEFT JOIN adresses as ad ON ad.id=ca.adresses_id"
  );
  //console.log(`List clients`, rows);
  return rows;
}

// creer de nouveaux clients
async function newClient(nom, prenom, adresse, email, motDePasse) {
  const [insertClient] = await promisePool.execute(
    "insert into clients (nom, prenom, email, motDePasse) values(?,?,?,?)",
    [nom, prenom, email, motDePasse]
  );
  //Récupérer l'ID du nouveau client inséré
  const clientId = insertClient.insertId;
  //console.log(`clientId`, clientId);
  const [insertAdresse] = await promisePool.execute(
    "INSERT INTO adresses (adresse) VALUES (?)",
    [adresse]
  );
  // Récupérer l'ID de la nouvelle adresse insérée
  const adresseId = insertAdresse.insertId;
  //console.log(`adresseId`, adresseId);
  const [link] = await promisePool.execute(
    "INSERT INTO clients_adresses (clients_id, adresses_id) VALUES (?, ?)",
    [clientId, adresseId]
  );
  return link;
}

// editer un client

async function editClient(id, nom, prenom, adresse, email, motDePasse) {
  const [editedClient] = await promisePool.execute(
    `UPDATE clients as cl LEFT JOIN clients_adresses as ca ON cl.id = ca.clients_id LEFT JOIN adresses as ad ON ad.id=ca.adresses_id SET cl.nom=?, cl.prenom=?, ad.adresse=?, cl.email=?, cl.motDePasse=? WHERE cl.id=?`,
    [nom, prenom, adresse, email, motDePasse, id]
  );
}

//supprimer un client
async function deleteClient(id) {
  const [row] = await promisePool.execute("delete from clients where id=?", [
    id,
  ]);
}

// réinitialiser un MdP
async function reinitialiserMdP(id, motDePasse) {
  const [rows] = await promisePool.execute(
    "UPDATE clients SET motDePasse=? where id=?",
    [motDePasse, id]
  );
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

//PIZZAS

//page pizzas
app.get("/admin/pizzas", async (req, res) => {
  const allPizzas = await listPizzas();
  //console.log(allPizzas);
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
  //console.log(`newPizza`);
  res.redirect("/admin/pizzas");
});

//page editer une pizza
app.get("/admin/pizzas/editer/:id", async (req, res) => {
  const [[getPizzaToEdit]] = await promisePool.execute(
    `select * FROM pizzas where id=?`,
    [req.params.id]
  );
  //console.log(getPizzaToEdit);

  res.render("ad-pizzas-editer", { pizzas: getPizzaToEdit });
});

//récuperer la requête d'editer une pizza
app.post("/admin/pizzas/editer/:id", async (req, res) => {
  //console.log(req.body);
  const editedPizzaCode = req.body.code;
  const editedPizzaLibelle = req.body.libelle;
  const editedPizzaIngredients = req.body.ingredients;
  const editedPizzaCategorie = req.body.categorie;
  const editedPizzaPrix = req.body.prix;
  const editedPizzaVersion = req.body.version_pizza;
  const PizzaEdited = await editPizza(
    editedPizzaCode,
    editedPizzaLibelle,
    editedPizzaIngredients,
    editedPizzaCategorie,
    editedPizzaPrix,
    editedPizzaVersion
  );
  res.redirect("/admin/pizzas");
});

//supppression d'une pizza
app.post("/admin/pizzas/delete/:id", async (req, res) => {
  const pizzaId = req.params.id;
  const pizzaDeleted = await deletePizza(pizzaId);
  //console.log(pizzaDeleted);
  res.redirect("/admin/pizzas");
});

//LIVREURS
//page livreurs
app.get("/admin/livreurs", async (req, res) => {
  const allLivreurs = await listLivreurs();
  //console.log(allLivreurs);
  res.render("ad-livreurs", { livreurs: allLivreurs });
});

//page creer un livreurs
app.get("/admin/livreurs/creer", async (req, res) => {
  const allLivreurs = await listLivreurs();
  //console.log(allLivreurs);
  res.render("ad-livreurs-creer", { livreurs: allLivreurs });
});

//récuperer la requête de création d'un nouveau livreurs
app.post("/admin/livreurs/creer", async (req, res) => {
  const newLivreurNom = req.body.nom;
  const newLivreurPrenom = req.body.prenom;
  const livreurAdded = await newLivreur(newLivreurNom, newLivreurPrenom);
  //console.log(`livreurAdded`);
  res.redirect("/admin/livreurs");
});

//page editer un livreur
app.get("/admin/livreurs/editer/:id", async (req, res) => {
  const [[getLivreurToEdit]] = await promisePool.execute(
    `select * FROM livreurs where id=?`,
    [req.params.id]
  );
  //console.log(getLivreurToEdit);

  res.render("ad-livreurs-editer", { livreurs: getLivreurToEdit });
});

//récuperer la requête d'editer un livreur
app.post("/admin/livreurs/editer/:id", async (req, res) => {
  //console.log(req.body);
  const editedLivreurId = req.params.id;
  const editedLivreurNom = req.body.nom;
  const editedLivreurPrenom = req.body.prenom;
  const livreurEdited = await editLivreur(
    editedLivreurId,
    editedLivreurNom,
    editedLivreurPrenom
  );
  res.redirect("/admin/livreurs");
});

//supppression d'un livreur
app.post("/admin/livreurs/delete/:id", async (req, res) => {
  const livreurId = req.params.id;
  const livreurDeleted = await deleteLivreur(livreurId);
  //console.log(livreurDeleted);
  res.redirect("/admin/livreurs");
});

// CLIENTS

//page clients
app.get("/admin/clients", async (req, res) => {
  const allClients = await listClients();
  //console.log(allClients);
  res.render("ad-clients", {
    clients: allClients,
  });
});

//page creer un client
app.get("/admin/clients/creer", async (req, res) => {
  //const allClients = await listClients();
  //console.log(allClients);
  res.render("ad-clients-creer", {
    //clients: allClients,
  });
});

//récuperer la requête de création d'un client
app.post("/admin/clients/creer", async (req, res) => {
  const newCLientNom = req.body.nom;
  const newClientPrenom = req.body.prenom;
  const newClientAdresse = req.body.adresse;
  const newClientEmail = req.body.email;
  //Les mots de passe sont chiffrés (algorithme de chiffrement BCrypt)
  const salt = bcrypt.genSaltSync(saltRounds);
  const newClientMotDePasse = bcrypt.hashSync(req.body.motDePasse, salt);
  console.log(`Console log requête création client :`, req.body);
  const clientAdded = await newClient(
    newCLientNom,
    newClientPrenom,
    newClientAdresse,
    newClientEmail,
    newClientMotDePasse
  );
  res.redirect("/admin/clients");
});

//page editer un client
app.get("/admin/clients/editer/:id", async (req, res) => {
  const [[getClientToEdit]] = await promisePool.execute(
    `select cl.*, ad.adresse, ad.id as ad_id from clients as cl LEFT JOIN clients_adresses as ca ON cl.id = ca.clients_id LEFT JOIN adresses as ad ON ad.id=ca.adresses_id where cl.id=?`,
    [req.params.id]
  );
  console.log(getClientToEdit);

  res.render("ad-clients-editer", { clients: getClientToEdit });
});

//récuperer la requête d'editer un client
app.post("/admin/clients/editer/:id", async (req, res) => {
  //console.log(req.body);
  const editedClientId = req.params.id;
  const editedClientNom = req.body.nom;
  const editedClientPrenom = req.body.prenom;
  const editedClientAdresse = req.body.adresse;
  const editedClientEmail = req.body.email;
  const editedClientMotDePasse = req.body.motDePasse;
  const clientEdited = await editClient(
    editedClientId,
    editedClientNom,
    editedClientPrenom,
    editedClientAdresse,
    editedClientEmail,
    editedClientMotDePasse
  );
  res.redirect("/admin/clients");
});

//supppression d'un client
app.post("/admin/clients/delete/:id", async (req, res) => {
  const clientId = req.params.id;
  const clientDeleted = await deleteClient(clientId);
  //console.log(clientDeleted);
  res.redirect("/admin/clients");
});
