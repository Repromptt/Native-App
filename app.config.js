import 'dotenv/config';

export default {
  expo: {
    name: "RePromptt",
    slug: "repromptt",
    version: "1.0.0",
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY
    },
     plugins: [
      "expo-web-browser"
    ]
  }
};
