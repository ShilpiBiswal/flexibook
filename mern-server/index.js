
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
const uri = 'mongodb://shilpi:shilpi0411@localhost:27017/';

// MongoClient
const client = new MongoClient(uri);
const dbName = 'BookInventory'; // Ensure dbName is available throughout
const collectionName = 'books';

//const replicateAPIKey = 'r8_16bNlqBW4iQfRaLdJluAl181vhpWalE3d5aVL';  // Add your Replicate API key here
//const replicateModelURL = 'https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions';




// connecting 
async function connect() {
  try {
    await client.connect();
    //creating collection
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
        let responseText = ''; // initialising response
        let booksFromDb = []; 
    
        // handling local requests
        if (message.toLowerCase().includes('tell me about') || message.toLowerCase().includes('book description')) {
          const bookTitle = message.split('about')[1].trim(); // book title from message
    
          // querying mongo
          const book = await bookCollections.findOne({ bookTitle: new RegExp(bookTitle, 'i') });
    
          if (book) {
            // if found in db use that
            responseText = `
            **Book Description for "${book.bookTitle}":**
            > ${book.bookDescription}
            `;
          } else {
            // external sources
            responseText = `
            **No description found for "${bookTitle}". Searching external sources...**
            `;
    
            // groq api request
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
    
            // concise answers
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
    
        //genre search 
        else if (message.toLowerCase().includes('find books in genre')) {
          const genre = message.split('genre')[1].trim(); // Extract genre from message
          booksFromDb = await bookCollections.find({ category: new RegExp(genre, 'i') }).toArray();
    
          if (booksFromDb.length > 0) {
            responseText = `
            **Books in Genre "${genre}":**
            ${booksFromDb.map((b, index) => `${index + 1}. ${b.bookTitle}`).join('\n')}
            `;
          } else {
            // external sources 
            responseText = `
            **No books found in genre "${genre}". Searching external sources...**
            `;
    
            
            const response = await axios.post(
              'https://api.groq.com/openai/v1/chat/completions', 
              {
                model: 'llama3-8b-8192', 
                messages: [{ role: 'user', content: message }],
              },
              {
                headers: {
                  'Authorization': 'Bearer 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', // Your Groq API key
                  'Content-Type': 'application/json',
                },
              }
            );
    
            
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
    
        //search based on author
        else if (message.toLowerCase().includes('find books by author')) {
          const author = message.split('author')[1].trim(); // Extract author name from message
    
          
          booksFromDb = await bookCollections.find({ authorName: new RegExp(author, 'i') }).toArray();
    
          if (booksFromDb.length > 0) {
            responseText = `
            **Books by Author "${author}":**
            ${booksFromDb.map((b, index) => `${index + 1}. ${b.bookTitle}`).join('\n')}
            `;
          } else {
            // external sources
            responseText = `
            **No books found by author "${author}". Searching external sources...**
            `;
    
            //api request
            const response = await axios.post(
              'https://api.groq.com/openai/v1/chat/completions', 
              {
                model: 'llama3-8b-8192', 
                messages: [{ role: 'user', content: message }],
              },
              {
                headers: {
                  'Authorization': 'Bearer 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', // Your Groq API key
                  'Content-Type': 'application/json',
                },
              }
            );
    
           
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
    
      
        else {
          responseText = 'Searching for your query in external sources...';
    
         
          const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions', 
            {
              model: 'llama3-8b-8192', 
              messages: [{ role: 'user', content: message }],
            },
            {
              headers: {
                'Authorization': 'Bearer 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', // Your Groq API key
                'Content-Type': 'application/json',
              },
            }
          );
    
         
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
    
        // final formatted response
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
