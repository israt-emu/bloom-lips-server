const express = require("express");
const {MongoClient} = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4g4am.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("lipstickDB");
    const productsCollection = database.collection("products");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");
    //get products
    app.get("/products", async (req, res) => {
      const query = req.query.size;
      const size = parseInt(query);
      const cursor = productsCollection.find({});
      let products;
      if (size) {
        products = await cursor.limit(size).toArray();
      } else {
        products = await cursor.toArray();
      }
      res.send(products);
    });
    //get products by id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const product = await productsCollection.findOne(query);
      res.send(product);
    });
    //add product to database
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    });
    //delete product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });
    //post user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    //upsert user
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = {email: user.email};
      const options = {upsert: true};
      const updateDoc = {$set: user};
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    //get user by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.send({admin: isAdmin});
    });
    //make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = {email: user.email};
      const updateDoc = {$set: {role: "admin"}};
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    //orders post
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });
    //get orders
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = {email: email};
      let orders;
      if (email) {
        const cursor = ordersCollection.find(query);
        orders = await cursor.toArray();
      } else {
        const cursor = ordersCollection.find({});
        orders = await cursor.toArray();
      }
      res.send(orders);
    });
    //delete order by id
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });
    //update order status
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const order = req.body;
      const status = order.status;
      const filter = {_id: ObjectId(id)};
      const updateDoc = {$set: {status: status}};
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    //save reviews to database
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
    //get review
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      console.log(reviews);
      res.send(reviews);
    });
    console.log("connected");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
