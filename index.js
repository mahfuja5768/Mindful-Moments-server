const express = require("express");
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

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
    // await client.connect();

    const blogCollection = client
      .db("Mindful-Moments-Today")
      .collection("allBlogs");

    const reviewsCollection = client
      .db("Mindful-Moments-Today")
      .collection("reviews");

    const wishlistCollection = client
      .db("Mindful-Moments-Today")
      .collection("wishlists");

    const usersCollection = client
      .db("Mindful-Moments-Today")
      .collection("users");

    //jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      console.log(token);
      res.send({ token });
    });

    //add review
    app.post("/reviews", async (req, res) => {
      try {
        const review = req.body;
        const result = await reviewsCollection.insertOne(review);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get reviews
    app.get("/reviews", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }
        const result = await reviewsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //all blogs title
    app.get("/topics", async (req, res) => {
      try {
        let query = {};
        const options = {
          projection: {
            topics: 1,
          },
        };
        const result = await blogCollection.find(query, options).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

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
            image: 1,
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
        if (req.query.topics) {
          query.topics = req.query.topics;
        }

        const result = await blogCollection
          .find(query)
          .sort({ date: -1 })
          .limit(6)
          .toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get foods by name
    app.get("/search-blogs/:title", async (req, res) => {
      try {
        const title = req.params.title;
        let query = { title: title };
        console.log(title);
        const result = await allFoodCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get all Blogs
    app.get("/all-blogs", async (req, res) => {
      try {
        let query = {};
        if (req.query.topics) {
          query.topics = req.query.topics;
        }
        const result = await blogCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get all Blogs of a user
    app.get("/owners-blogs", async (req, res) => {
      try {
        let query = {};
        if (req.query?.author) {
          query = { author: req.query.author };
        }
        const result = await blogCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get single Blog
    app.get("/get-single-blog/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await blogCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //add to wishlist
    app.post("/add-to-wishlist", async (req, res) => {
      try {
        const blog = req.body;
        const result = await wishlistCollection.insertOne(blog);
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
        console.log(id);
        const query = { _id: new ObjectId(id) };
        console.log(query);
        const result = await wishlistCollection.deleteOne(query);
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //add a new blog by user
    app.post("/add-new-blog", async (req, res) => {
      try {
        const newBlog = req.body;
        console.log(newBlog);
        const result = await blogCollection.insertOne(newBlog);
        console.log(result);
        res.json(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
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

    //delete added blog
    app.delete("/delete-blog/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await blogCollection.deleteOne(query);
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // Save or modify user email, status in DB
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      console.log(user);
      const query = { email: email };
      const options = { upsert: true };
      const isExist = await usersCollection.findOne(query);
      console.log("User found?----->", isExist);
      if (isExist) return res.send(isExist);
      const result = await usersCollection.updateOne(
        query,
        {
          $set: { ...user, timestamp: Date.now() },
        },
        options
      );
      console.log(result);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
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
