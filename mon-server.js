const mongoose = require("mongoose");
const config = require('./config/index.json')

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_LOCAL,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            });
        console.log("Mongo DB Local is Connected.")
    } catch (err) {
        console.log(err);
    }
}

connectDB();