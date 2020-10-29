const express = require("express");
const app = express();
const { body, validationResult } = require('express-validator');
const config = require('./config/index.json')
const bcrypt = require("bcrypt");

const randomString = require('randomString')
const router = express.Router();
const nodemailer = require("nodemailer");
//Import Models 
const User = require('./user_schems');
const adminUser = require('./admin_schems');

router.get('/', async (req, res) => {
    try {
        const userData = await User.find({}, '-password -_id');
        res.status(200).json(userData);
    } catch (err) {
        console.error(err)
        res.status(500).json({ "error": err });
    }

});

router.post('/', [
    body('firstName', "First Name is Required").notEmpty(),
    body('lastName', "Last Name is required").isString(),
    body('role', "User Role is required").isString(),
    body('email', "Enter Valid Email").isEmail(),
    body('password', "Enter Password").isLength({ min: 6 }),
    body('password2', "Password Do Not Match").custom((value, { req }) => {
        if (value === req.body.password) {
            return true;
        } else {
            return false;
        }
    }),
],
   
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {   
            let { firstName, lastName, email, password,role } = req.body;
            let customer = "customer";
            let admin = "admin"
            if(role===customer){
                const user = await User.findOne({ email: email });
            
                if (user) {
                    
                    return res.status(401).json({ "Error": "User account is already existed" });
    
                }
                //salting password
                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
                password = await bcrypt.hash(password, salt);
                const token = randomString.generate();
               
                const userData = {
                    email, password, lastName, firstName, token, role
                };
    
                const newUser = new User(userData);
                await newUser.save();
    
                res.status(200).json({ "Success": "User Registered" }); 
            };

            if(role===admin){
                const user = await adminUser.findOne({ email: email });
            
                if (user) {
                    
                    return res.status(401).json({ "Error": "User account is already existed" });
    
                }
                //salting password
                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
                password = await bcrypt.hash(password, salt);
                const token = randomString.generate();
               
                const userData = {
                    email, password, lastName, firstName, token, role
                };
    
                const newUser = new adminUser(userData);
                await newUser.save();
    
                res.status(200).json({ "Success": "User Registered" }); 
            }
           
            

        } catch (err) {
            console.log(err)
            res.status(500).json({ "error": err });
        }

    });

router.all('/verify/:token', async (req, res) => {
    try {
        // console.log()
        await User.findOneAndUpdate(
            { token: req.params.token },
            { $set: { verified: true } }
        );
        res.send(`<h1> You have successfully verify your account, Enjoy 300 $ credit for upcoming three months, commmon man just kidding</h1>`)

    } catch (err) {
        res.status(500).json({ "Error": "Server Error" });
    }
})



module.exports = router;