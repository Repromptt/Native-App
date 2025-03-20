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
    myexpense: Number,
    category: String,
    contacts: [String],
    createdAt: { type: Date, default: Date.now },
  }]
});
const User = mongoose.model('User', userSchema);
module.exports = User;

// LLM-based NLP Processing using Gemini
const CATEGORY_LIST = [
    "food", "groceries", "travel", "stays", "bills", "subscription",
    "shopping", "gifts", "drinks", "fuels", "debt", "health",
    "entertainment", "misc"
  ];
  
  async function processExpenseData(brief) {
    try {
      const API_KEY = process.env.GEMINI_API_KEY;
      if (!API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in environment variables");
      }
  
      // Construct the prompt with category constraints
      const prompt = `
        Extract the following details from this expense description:
        - **Item Name**
        - **Expense Amount** (in numerical format)
        - **Category** (choose only from: ${CATEGORY_LIST.join(", ")})
  
        Description: ${brief}
      `;
  
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        },
        { headers: { "Content-Type": "application/json" } }
      );
  
      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        throw new Error("Invalid response from Gemini API");
      }
  
      // Extract values using regex
      const itemNameMatch = responseText.match(/\*\*Item Name:\*\* (.*)/);
      const expenseAmountMatch = responseText.match(/\*\*Expense Amount:\*\* (\d+(\.\d+)?)/);
      const categoryMatch = responseText.match(/\*\*Category:\*\* ([\w\s]+)/);
  
      let itemName = itemNameMatch ? itemNameMatch[1].trim() : brief;
      let expenseAmount = expenseAmountMatch ? parseFloat(expenseAmountMatch[1]) : 0;
      let category = categoryMatch ? categoryMatch[1].trim().toLowerCase() : "misc";
  
      // Ensure category is in the predefined list (fallback to "misc" if not matched)
      category = CATEGORY_LIST.includes(category) ? category : "misc";
  
      return { itemName, expenseAmount, category };
    } catch (error) {
      console.error("Error processing expense data:", error.message);
      return { itemName: brief, expenseAmount: 0, category: "misc" };
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
    let user = await User.findOne({ UserID: userId });
    if (!user) {
      user = new User({ UserID: userId, expenses: [] });
    }
    const count = contacts.length + 1; 
    const myexpense = expenseAmount / count;

    

    // Add the new expense
    user.expenses.push({ itemName, expenseAmount,myexpense, category, contacts, createdAt: Date.now() });

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
  user = new User({ UserID: userId, expenses: [] });
  await user.save();
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
