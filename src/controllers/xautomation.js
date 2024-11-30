const { Client, auth } = require("twitter-api-sdk");
const axios = require("axios");
const cron = require("node-cron");
const dotenv = require("dotenv");

dotenv.config();

const URL = process.env.URL || "http://127.0.0.1";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8003; // Changed default PORT to 8003

// Twitter OAuth 2.0 setup
const authClient = new auth.OAuth2User({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  callback: `${URL}:${PORT}/api/x-automation/auth`, // Updated callback URL to match the auth handler route
  scopes: ["tweet.read", "tweet.write", "users.read"],
});
const twitterClient = new Client(authClient);

const STATE = "my-state";
let isTwitterAuthorized = false;
let lastPostedArticles = new Set(); // Track previously posted articles

const fetchNews = async () => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`
    );
    return response.data.articles.filter(
      (article) => !lastPostedArticles.has(article.title)
    );
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

const postToTwitter = async () => {
  try {
    const articles = await fetchNews();
    if (articles.length === 0) {
      console.log("No new articles to post on Twitter");
      return;
    }

    const article = articles[0];
    const newsTitle = article.title;
    const newsDetails = `${newsTitle}\n\n${article.description}\nSource: ${article.source.name}\n${article.url}`;
    lastPostedArticles.add(newsTitle);

    await twitterClient.tweets.createTweet({
      text: newsDetails,
    });
    console.log(`Successfully posted to Twitter: "${newsTitle}"`);
  } catch (error) {
    console.error("Twitter post error:", error);
    isTwitterAuthorized = false;
    throw error;
  }
};

// Unified Twitter OAuth handler
const authHandler = async (req, res) => {
  try {
    const { code, state } = req.query;
    console.log(code, state);
    if (code) {
      if (state !== STATE) {
        return res.status(400).send("State mismatch error");
      }
      await authClient.requestAccessToken(code);
      isTwitterAuthorized = true;
      res.send(
        "Twitter authorization successful! Automated posts will now begin."
      );
    } else {
      const authUrl = authClient.generateAuthURL({
        state: STATE,
        code_challenge_method: "s256",
      });
      res.redirect(authUrl);
    }
  } catch (error) {
    console.error("Auth Handler Error:", error);
    res.status(500).send("Twitter authentication failed");
  }
};

const revokeHandler = async (req, res) => {
  try {
    await authClient.revokeAccessToken();
    isTwitterAuthorized = false;
    res.send("Twitter access revoked successfully");
  } catch (error) {
    console.error("Revoke Handler Error:", error);
    res.status(500).send("Failed to revoke Twitter access");
  }
};

// Clean up lastPostedArticles every 24 hours to prevent memory growth
const clearPostedArticles = () => {
  lastPostedArticles.clear();
  console.log("Cleared lastPostedArticles set");
};

setInterval(clearPostedArticles, 24 * 60 * 60 * 1000);

// Automated Twitter posts every minute
const scheduleTwitterPosts = () => {
  cron.schedule("*/1 * * * *", async () => {
    try {
      if (isTwitterAuthorized) {
        await postToTwitter();
        console.log("Scheduled Twitter post completed successfully");
      } else {
        console.log("Skipping Twitter post - not authorized");
      }
    } catch (error) {
      console.error("Scheduled Twitter post failed:", error);
    }
  });
};

// Initialize the scheduler
scheduleTwitterPosts();

module.exports = {
  authHandler,
  revokeHandler,
};
