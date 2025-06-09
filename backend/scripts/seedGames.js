const mongoose = require('mongoose');
const Game = require('../models/Game');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initial games data
const initialGames = [
    {
        name: "Spin The Wheel",
        gameType: "SpinTheWheel",
        points: 3,
        config: {
            spinConfig: {
                includeFreeSpin: false,
                includeTryAgain: false
            }
        },
        featured: false
    },
    {
        name: "Slot Machine",
        gameType: "SlotMachine",
        points: 5,
        featured: false
    },
    {
        name: "Memory Match",
        gameType: "CardMatchingGame",
        points: 2,
        featured: false
    }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            // Clear existing games
            await Game.deleteMany({});
            console.log('Cleared existing games');

            // Insert new games
            const games = await Game.insertMany(initialGames);
            console.log('Seeded games:', games);

            process.exit(0);
        } catch (error) {
            console.error('Error seeding games:', error);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }); 