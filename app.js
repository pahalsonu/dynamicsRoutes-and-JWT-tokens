const express = require("express");
const app = express();
const userRoutes = require('./user_routes');
//import mongo server
require("./mon-server");

const port = process.env.PORT || 5000;

app.use(express.json());


app.get('/hello', (req,res)=>{
    res.send("This is Home Route");
});

app.use('/users',userRoutes);

app.listen(port, ()=>{
    console.log(`Server Started at ${port}`);
});
