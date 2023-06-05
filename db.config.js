const mongoose = require('mongoose');   

const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://eonsinde:Helicopter@123@bode-db.qsz2vao.mongodb.net/?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        console.log(`\n\nMongoDB Connected: ${conn.connection.host}\n\n`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = connectDB;