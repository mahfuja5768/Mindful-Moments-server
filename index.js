const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mz3fw7v.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const blogCollection = client
      .db("Mindful-Moments-Today")
      .collection("allBlogs");

    const wishlistCollection = client
      .db("Mindful-Moments-Today")
      .collection("wishlists");

    //get most Liked Blogs
    app.get("/most-liked-blogs", async (req, res) => {
      try {
        let query = {};
        const options = {
          projection: {
            title: 1,
            author: 1,
            likedCount: 1,
            date: 1,
          },
        };
        const result = await blogCollection
          .find(query, options)
          .sort({ likedCount: -1 })
          .limit(6)
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //increase like of blog
    app.put("/increase-liked/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        // console.log(query);
        const liked = {
          $inc: { likedCount: +1 },
        };
        const option = { upsert: true };
        const result = await blogCollection.updateOne(query, liked, option);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //decrease like of blog
    app.put("/decrease-liked/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        // console.log(query);
        const liked = {
          $inc: { likedCount: -1 },
        };
        const option = { upsert: true };
        const result = await blogCollection.updateOne(query, liked, option);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get recent Blogs
    app.get("/recent-blogs", async (req, res) => {
      try {
        let query = {};
        const options = {
          projection: {
            title: 1,
            author: 1,
            likedCount: 1,
            date: 1,
            description: 1,
          },
        };
        const result = await blogCollection
          .find(query, options)
          .sort({ date: -1 })
          .limit(6)
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get all Blogs
    app.get("/all-blogs", async (req, res) => {
      try {
        let query = {};
        const options = {
          projection: {
            title: 1,
            author: 1,
            likedCount: 1,
            date: 1,
            description: 1,
          },
        };
        const result = await blogCollection.find(query, options).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //add to wishlist
    app.post("/add-to-wishlist", async (req, res) => {
      try {
        const blogId = req.body;
        const result = await wishlistCollection.insertOne(blogId);
        res.json(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get wishlist Blogs
    app.get("/wishlist-blogs", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }
        const result = await wishlistCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //delete wishlist Blogs
    app.delete("/delete-wishlist-blog/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await wishlistCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //add a new blog
    app.post("/add-new-blog", async (req, res) => {
      try {
        const newBlog = req.body;
        const result = await blogCollection.insertOne(newBlog);
        res.json(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get added Blogs
    app.get("/get-added-blogs", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }
        const result = await blogCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //update added blog
    app.put("/update-blog/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };
        const body = req.body;
        console.log(body);
        const updatedBlog = {
          $set: { ...body },
        };
        const option = { upsert: true };
        const result = await blogCollection.updateOne(
          query,
          updatedBlog,
          option
        );
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("mindful moments blog page is running....");
});

app.listen(port, () => {
  console.log(`mindful moments blog page is running on ${port}`);
});
