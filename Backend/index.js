const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const axios = require('axios');
// Example using Express.js
const cors = require('cors');


const app = express();
app.use(bodyParser.json());
app.use(cors(
    {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    }
));
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {console.log('MongoDB Connected');
    console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
}
)
.catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  UserID: String,
  expenses: [{
    itemName: String,
    expenseAmount: Number,
    category: String,
    contacts: [String],
    createdAt: { type: Date, default: Date.now },
  }]
});
const User = mongoose.model('User', userSchema);
module.exports = User;

// LLM-based NLP Processing using Gemini
async function processExpenseData(brief) {
    try {
      const API_KEY = process.env.GEMINI_API_KEY;
      if (!API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in environment variables");
      }
  
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: `Extract item name, expense amount, and category from this expense description: ${brief}` }],
            },
          ],
        },
        { headers: { "Content-Type": "application/json" } }
      );
  
      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(responseText);
  
      // Manual parsing
      const lines = responseText.split('\n');
      let itemName = '', expenseAmount = 0, category = '';
  
      lines.forEach(line => {
        if (line.includes('* **Item Name:**')) {
          const itemNamePart = line.replace('* **Item Name:**', '').trim();
          itemName = itemNamePart;
        } else if (line.includes('* **Expense Amount:**')) {
          const expenseAmountPart = line.replace('* **Expense Amount:**', '').trim();
          expenseAmount = parseInt(expenseAmountPart) || 0;
        } else if (line.includes('* **Category:**')) {
          const categoryPart = line.replace('* **Category:**', '').trim();
          // Remove any additional text in parentheses
          category = categoryPart.replace(/\(.*\)/, '').trim();
        }
      });
  
      return { itemName, expenseAmount, category };
    } catch (error) {
      console.error("Error processing expense data:", error.message);
      return { itemName: brief, expenseAmount: 0, category: "Uncategorized" };
    }
  }
  
  
  // Route to Add Expense
  app.post('/add-expense', async (req, res) => {
    try {
      const { userId, brief, contacts } = req.body;
      console.log(req.body);
  
      if (!Array.isArray(contacts) || contacts.some(contact => typeof contact !== 'string')) {
        return res.status(400).json({ message: 'Invalid contacts format. Contacts must be an array of strings.' });
      }
  
      // NLP Function to Extract Data
      const { itemName, expenseAmount, category } = await processExpenseData(brief);
      console.log(itemName, expenseAmount, category);
      if (!itemName || !category) {
        return res.status(400).json({ message: 'Failed to extract item name or category.' });
      }
      else{
        console.log("Item Name: ", itemName);
        console.log("Expense Amount: ", expenseAmount);
        console.log("Category: ", category);
      }
  
      console.log(userId);
       // Fetch the user document
    const user = await User.findOne({ UserID: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Add the new expense
    user.expenses.push({ itemName, expenseAmount, category, contacts, createdAt: Date.now() });

    // Save the user document
    await user.save();

    console.log('saved');
    res.status(201).json({ message: 'Expense added successfully', expense: user.expenses[user.expenses.length - 1] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  });
  


// Route to get all expenses of a specific user
app.get("/expenses", async (req, res) => {
    const { userId } = req.query; // Use req.query for query parameters
  
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
  
    try {
      const user = await User.findOne({ UserID: userId });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({
        userId: user.UserID,
        expenses: user.expenses,
      });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
