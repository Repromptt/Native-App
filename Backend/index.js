const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const axios = require('axios');
// Example using Express.js
const cors = require('cors');


const app = express();
app.use(bodyParser.json());
app.use(cors());
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
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

// LLM-based NLP Processing using Gemini
async function processExpenseData(brief) {
  try {
    const response = await axios.post('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      contents: [{
        role: 'user',
        parts: [{ text: `Extract item name, expense amount, and category from this expense description: ${brief}` }]
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const parsedData = JSON.parse(response.data.candidates[0].content.parts[0].text);
    const { itemName, expenseAmount, category } = parsedData;
    return { itemName, expenseAmount, category };
  } catch (error) {
    console.error('Error processing expense data:', error.message);
    return { itemName: brief, expenseAmount: 0, category: 'Uncategorized' };
  }
}

// Route to Add Expense
app.post('/add-expense', async (req, res) => {
  try {
    const { userId, brief, contacts } = req.body;

    // NLP Function to Extract Data
    const { itemName, expenseAmount, category } = await processExpenseData(brief);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.expenses.push({ itemName, expenseAmount, category, contacts });
    await user.save();

    res.status(201).json({ message: 'Expense added successfully', expense: user.expenses[user.expenses.length - 1] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Route to get all expenses of a specific user
app.get("/expenses/:userId", async (req, res) => {
    const { userId } = req.params;
  
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
