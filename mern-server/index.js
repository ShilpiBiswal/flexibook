const express = require('express')
const app = express()
const port = process.env.PORT || 5500
const cors = require('cors')

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const { MongoClient, ObjectId } = require('mongodb');

// Connection URI
const uri = 'mongodb://shilpi:shilpi0411@localhost:27017';

// Create a new MongoClient
const client = new MongoClient(uri);

// Connect to the MongoDB database
async function connect() {
  try {
    await client.connect();
    //create collection
    const bookCollections=client.db("BookInventory").collection("books");
    //insert book using post method
    app.post("/upload-book",async(req,res)=>{
      const data=req.body;
      const result=await bookCollections.insertOne(data);
      res.send(result);
    })
    //get all books from database : get
    app.get("/all-books",async(req,res)=>{
      const books=bookCollections.find();
      const result=await books.toArray();
      res.send(result);
    })
    //update a book data : patch or post
    app.patch("/book/:id",async(req,res)=>{
      const id=req.params.id;
      //console.log(id);
      const updateBookData=req.body;
      const filter={_id: new ObjectId(id)}
      const options={upsert:true};
      const updateDoc={
        $set:{
          ...updateBookData
        }
      }
      //update
      const result=await bookCollections.updateOne(filter,updateDoc,options)
      res.send(result);
    })

    //delete a book data
    app.delete("/book/:id",async(req,res)=>{
      const id=req.params.id;
      const filter={_id: new ObjectId(id)};
      const result=await bookCollections.deleteOne(filter);
      res.send(result);
    })
    
    //find by category
    app.get("/all-books",async(req,res)=>{
      let query={};
      if(req.query?.category){
        query={category:req.query.category}
      }
      const result=await bookCollections.find(query).toArray();
      res.send(result);
    })

    //get single book data
    app.get("/book/:id",async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const result=await bookCollections.findOne(filter);
      res.send(result);
    })

    console.log('Connected successfully to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

connect();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})