const express=require('express')
const app = express()
const port = process.env.PORT || 5500

const axios = require('axios');
const cors = require('cors')

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

 

const { MongoClient, ObjectId } = require('mongodb');


// Connection URI
const uri = 'mongodb://localhost:27017/';

// Create a new MongoClient
const client = new MongoClient(uri);
const dbName = 'BookInventory'; // Ensure dbName is available throughout
const collectionName = 'books';

//const replicateAPIKey = 'r8_16bNlqBW4iQfRaLdJluAl181vhpWalE3d5aVL';  // Add your Replicate API key here
//const replicateModelURL = 'https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions';




// Connect to the MongoDB database
async function connect() {
  try {
    await client.connect();
    //create collection
    const bookCollections=client.db("BookInventory").collection("books");
    
   
    app.post("/upload-book",async(req,res)=>{
      const data=req.body;
      const result=await bookCollections.insertOne(data);
      res.send(result);
    })
    
    app.get("/all-books",async(req,res)=>{
      const books=bookCollections.find();
      const result=await books.toArray();
      res.send(result);
    })
    
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

    app.delete("/book/:id",async(req,res)=>{
      const id=req.params.id;
      const filter={_id: new ObjectId(id)};
      const result=await bookCollections.deleteOne(filter);
      res.send(result);
    })
    
    app.get("/all-books",async(req,res)=>{
      let query={};
      if(req.query?.category){
        query={category:req.query.category}
      }
      const result=await bookCollections.find(query).toArray();
      res.send(result);
    })

    app.get("/book/:id",async(req,res)=>{
      const id=req.params.id;
      const filter={_id:new ObjectId(id)};
      const result=await bookCollections.findOne(filter);
      res.send(result);
    })
    
    function limitTo50Words(text) {
      const words = text.split(' ');
      return words.slice(0, 50).join(' ') + (words.length > 50 ? '...' : ''); // Add ellipsis if more than 50 words
    }
    
    //const axios = require('axios');

    app.post('/chat', async (req, res) => {
      const { message } = req.body;
    
      if (!message) {
        return res.status(400).send({ error: 'Message text is required' });
      }
    
      try {
        let responseText = ''; // Initialize the response message
        let booksFromDb = []; // Variable to store MongoDB results
    
        // Handle book description request (like "Tell me about 'Book Title'" or "book description")
        if (message.toLowerCase().includes('tell me about') || message.toLowerCase().includes('book description')) {
          const bookTitle = message.split('about')[1].trim(); // Extract book title from message
    
          // Query MongoDB for the book's description
          const book = await bookCollections.findOne({ bookTitle: new RegExp(bookTitle, 'i') });
    
          if (book) {
            // If book is found in the DB, use the description from DB
            responseText = `
            **Book Description for "${book.bookTitle}":**
            > ${book.bookDescription}
            `;
          } else {
            // If book is not found in the DB, check external sources (Groq API)
            responseText = `
            **No description found for "${bookTitle}". Searching external sources...**
            `;
    
            // Make the request to Groq API using axios
            const response = await axios.post(
              'https://api.groq.com/openai/v1/chat/completions', 
              {
                model: 'llama3-8b-8192', 
                messages: [{ role: 'user', content: message }],
              },
              {
                headers: {
                  'Authorization': 'Bearer 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', 
                  'Content-Type': 'application/json',
                },
              }
            );
    
            // Include only concise text if Groq response contains suggestions
            if (response.data && response.data.choices && response.data.choices.length > 0) {
              responseText += `
              **Suggested Description from External Sources:**
              > ${response.data.choices[0].message.content.trim()}
              `;
            } else {
              responseText += `
              **No additional suggestions found from external sources.**
              `;
            }
          }
        }
    
        // Handle genre search (like "find books in genre Fiction")
        else if (message.toLowerCase().includes('find books in genre')) {
          const genre = message.split('genre')[1].trim(); // Extract genre from message
    
          // Query MongoDB for books in the specified genre
          booksFromDb = await bookCollections.find({ category: new RegExp(genre, 'i') }).toArray();
    
          if (booksFromDb.length > 0) {
            responseText = `
            **Books in Genre "${genre}":**
            ${booksFromDb.map((b, index) => `${index + 1}. ${b.bookTitle}`).join('\n')}
            `;
          } else {
            // If no books found, check external sources (Groq API)
            responseText = `
            **No books found in genre "${genre}". Searching external sources...**
            `;
    
            // Make the request to Groq API using axios
            const response = await axios.post(
              'https://api.groq.com/openai/v1/chat/completions', // Groq's API URL
              {
                model: 'llama3-8b-8192', // Or replace with the appropriate Groq model
                messages: [{ role: 'user', content: message }],
              },
              {
                headers: {
                  'Authorization': 'Bearer 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', // Your Groq API key
                  'Content-Type': 'application/json',
                },
              }
            );
    
            // Include only concise text if Groq response contains suggestions
            if (response.data && response.data.choices && response.data.choices.length > 0) {
              responseText += `
              **Suggested Books from External Sources:**
              > ${response.data.choices[0].message.content.trim()}
              `;
            } else {
              responseText += `
              **No additional suggestions found from external sources.**
              `;
            }
          }
        }
    
        // Handle author search (like "find books by author")
        else if (message.toLowerCase().includes('find books by author')) {
          const author = message.split('author')[1].trim(); // Extract author name from message
    
          // Query MongoDB for books by the specified author
          booksFromDb = await bookCollections.find({ authorName: new RegExp(author, 'i') }).toArray();
    
          if (booksFromDb.length > 0) {
            responseText = `
            **Books by Author "${author}":**
            ${booksFromDb.map((b, index) => `${index + 1}. ${b.bookTitle}`).join('\n')}
            `;
          } else {
            // If no books found, check external sources (Groq API)
            responseText = `
            **No books found by author "${author}". Searching external sources...**
            `;
    
            // Make the request to Groq API using axios
            const response = await axios.post(
              'https://api.groq.com/openai/v1/chat/completions', // Groq's API URL
              {
                model: 'llama3-8b-8192', // Or replace with the appropriate Groq model
                messages: [{ role: 'user', content: message }],
              },
              {
                headers: {
                  'Authorization': 'Bearer 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', // Your Groq API key
                  'Content-Type': 'application/json',
                },
              }
            );
    
            // Include only concise text if Groq response contains suggestions
            if (response.data && response.data.choices && response.data.choices.length > 0) {
              responseText += `
              **Suggested Books from External Sources:**
              > ${response.data.choices[0].message.content.trim()}
              `;
            } else {
              responseText += `
              **No additional suggestions found from external sources.**
              `;
            }
          }
        }
    
        // Fallback for any other message (external sources)
        else {
          responseText = 'Searching for your query in external sources...';
    
          // Make the request to Groq API for any other query
          const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions', // Groq's API URL
            {
              model: 'llama3-8b-8192', // Or replace with the appropriate Groq model
              messages: [{ role: 'user', content: message }],
            },
            {
              headers: {
                'Authorization': 'Bearer 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', // Your Groq API key
                'Content-Type': 'application/json',
              },
            }
          );
    
          // Include only concise text if Groq response contains suggestions
          if (response.data && response.data.choices && response.data.choices.length > 0) {
            responseText = `
            
            > ${response.data.choices[0].message.content.trim()}
            `;
          } else {
            responseText = `
            **No additional suggestions found from external sources.**
            `;
          }
        }
    
        // Send the final formatted response (either from MongoDB or Groq)
        res.json({ response: responseText.trim() });
    
      } catch (error) {
        console.error('Error in /chat route:', error);
        res.status(500).send({ error: 'Failed to process chat request' });
      }
    });
    
    
    
    


    console.log('Connected successfully to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}




connect();



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
