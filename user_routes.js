const express = require("express");
const app = express();
const { body, validationResult } = require('express-validator');
const config = require('./config/index.json')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const randomString = require('randomString')
const router = express.Router();
const nodemailer = require("nodemailer");
//Import Models 
const User = require('./user_schems');
const adminUser = require('./admin_schems');


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
                
               
                const userData = {
                    email, password, lastName, firstName,  role
                };
    
                const newUser = new User(userData);

                const key = config.secret_key;
                const payload = {
                    user: {
                      id: newUser._id,
                      role : newUser.role
                    },
                   
                }
                const accessToken = await jwt.sign(payload, key, { expiresIn: 6000 });



                await newUser.save();
    
                res.status(200).json({ accessToken });
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
                               
                const userData = {
                    email, password, lastName, firstName, role
                };
    
                const newUser = new adminUser(userData);
                const key = config.secret_key;
                const payload = {
                    user: {
                      id: newUser._id,
                      role : newUser.role
                    },
                   
                }
                const accessToken = await jwt.sign(payload, key, { expiresIn: 6000 });



                await newUser.save();
    
                res.status(200).json({ accessToken });
            }
           
            

        } catch (err) {
            console.log(err)
            res.status(500).json({ "error": err });
        }

    });

    router.get('/login', [

        body("email", "Email is required").notEmpty().isEmail(),
        body("password", "Password is Required").notEmpty()
      ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(403).json({ Errors: errors.array() });
        }
        try {
          const { email, password } = req.body;
      
          let customer = await User.findOne({ email: email });
          let admin = await adminUser.findOne({ email: email });
          if (customer) {
            const isValid = await bcrypt.compare(password, customer.password);
            if (!isValid) {
              return res.status(401).json({ Error: "Invalid Credentials" });
            }
            const payload = {
              user: {
                id: customer._id,
                role : customer.role
              }
            }
            const key = config.secret_key;
            const accessToken = await jwt.sign(payload, key, { expiresIn: 6000 });
            return res.json({ accessToken });
            
          };
          if (admin) {
            const isValid = await bcrypt.compare(password, admin.password);
            if (!isValid) {
              return res.status(401).json({ Error: "Invalid Credentials" });
            }
            const payload = {
              user: {
                id: admin._id,
                role : admin.role,
                email:admin.email
              }
            }
            const key = config.secret_key;
            const accessToken = await jwt.sign(payload, key, { expiresIn: 6000 });
            return res.json({ accessToken });
            
          }
          
      
        } catch (err) {
          console.error(err);
          return res.status(500).json({ Errors: "Server Error" });
        }
      })



module.exports = router;