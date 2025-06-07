require('dotenv').config();
const database = require('../models/database');
const Post = require('../models/Post');
const { generateUniqueSessionId, hashSession, hashIP } = require('../utils/security');

// Sample seed data
const samplePosts = [
  {
    content: "Just saw a beautiful sunset at the park! Perfect evening for a walk.",
    post_type: "random",
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    content: "Coffee shop on Main Street has amazing pastries - highly recommend the croissants!",
    post_type: "recommendation",
    latitude: 40.7130,
    longitude: -74.0058
  },
  {
    content: "Community cleanup event this Saturday at 9 AM in Central Park. Bring gloves!",
    post_type: "event",
    latitude: 40.7131,
    longitude: -74.0062
  },
  {
    content: "Road closure on Oak Street due to construction - find alternate route",
    post_type: "alert",
    latitude: 40.7129,
    longitude: -74.0059
  },
  {
    content: "Anyone know a good plumber in the area? Need help with a leaky faucet.",
    post_type: "question",
    latitude: 40.7127,
    longitude: -74.0061
  },
  {
    content: "Farmers market is back! Every Thursday from 3-7 PM at the town square.",
    post_type: "event",
    latitude: 40.7132,
    longitude: -74.0057
  },
  {
    content: "New pizza place opened - thin crust is incredible! Support local business.",
    post_type: "recommendation",
    latitude: 40.7126,
    longitude: -74.0063
  },
  {
    content: "Found a lost dog near the library - brown lab with blue collar. Please share!",
    post_type: "alert",
    latitude: 40.7133,
    longitude: -74.0056
  }
];

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    await database.connect();
    
    // Check if posts already exist
    const existingPosts = await database.get('SELECT COUNT(*) as count FROM posts');
    
    if (existingPosts.count > 0) {
      console.log(`Database already has ${existingPosts.count} posts. Skipping seed.`);
      await database.close();
      return;
    }
    
    console.log('Creating sample posts...');
    
    // Create sample posts
    for (const postData of samplePosts) {
      const sessionHash = hashSession(generateUniqueSessionId());
      const ipHash = hashIP('127.0.0.1');
      
      await Post.create({
        ...postData,
        sessionHash,
        ipHash
      });
      
      console.log(`Created post: ${postData.content.substring(0, 50)}...`);
    }
    
    console.log(`Successfully created ${samplePosts.length} sample posts`);
    await database.close();
    
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
