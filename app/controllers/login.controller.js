const db = require("../models");
const user_account = db.user_account;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const token_secret = "sm139pfjfalf20nva";

// exports.requestLogin = async (req, res) => {
//     try {
//         const condition = {
//             username : req.body.username,
//         }
    
//         const password = req.body.password
    
//         const dataUserCheck = await user_account.findOne(condition);

//         console.log("dataUserCheck", dataUserCheck)

//         if(dataUserCheck) {
//             const checkPassword = await bcrypt.compare(password, dataUserCheck['password']);

//             if(checkPassword) {
//                 console.log("login");
//                 console.log("checkPassword", checkPassword);

//                 const payload = {
//                     ...req.body,
//                 }

//                 delete payload['password'];

//                 const token = jwt.sign(payload, token_secret);
//                 payload['token'] = token;

//                 user_account.updateOne(condition, {token : token}, (err, raw) => {
//                     res.json({
//                         payload : payload,
//                         statusCode : 1,
//                         message : "Login Berasil!"
//                     });
//                 });

//             } else {
//                 res.json({
//                     statusCode : 0,
//                     message : "Password Salah!"
//                 });
//             }

//             // if(checkPassword) {
//             //     const payload = {
//             //         ...resultDataUser,
//             //     }

//             //     const token = jwt.sign(payload, token_secret);
//             //     payload['token'] = token;

//             //     const time = moment();

//             //     user_account.updateOne(condition, {token : token, last_login: time}, (err, raw) => {
//             //         res.json(payload);
//             //     })
//             // } else {
//             //     res.json({statusCode : 0, message : "Password Wrong"});
//             // }
//         } else {
//             res.json({statusCode : 0, message : "Error User"})
//         }

//     } catch(err) {

//     }
// }

exports.requestLogin = async (req, res) => {
    try {
        const condition = {
            username: req.body.body.username,
        }
    
        const password = req.body.body.password
        console.log("req.body", req.body.body)

        const dataUserCheck = await user_account.findOne(condition);

        // Hapus token lama dari user yang masuk
        if (dataUserCheck && dataUserCheck['token']) {
            dataUserCheck['token'] = null;
            await user_account.updateOne(condition, {token: null});
        }

        console.log("dataUserCheck", dataUserCheck)

        if (dataUserCheck) {
            const checkPassword = await bcrypt.compare(password, dataUserCheck['password']);

            if (checkPassword) {
                console.log("login");
                console.log("checkPassword", checkPassword);

                const payload = {
                    ...req.body,
                }

                delete payload['password'];

                const token = jwt.sign(payload, token_secret);
                payload['token'] = token;

                user_account.updateOne(condition, {token: token}, (err, raw) => {
                    res.json({
                        payload: payload,
                        statusCode: 1,
                        message: "Login Berhasil!"
                    });
                });

            } else {
                res.json({
                    statusCode: 0,
                    message: "Password Salah!"
                });
            }
        } else {
            res.json({statusCode: 0, message: "Error User"})
        }

    } catch(err) {
        // Tangani error disini
    }
}




// Create and Save a new Tutorial
exports.create = async (req, res) => {
    // try {

    //     const data = {
    //         ...req.body
    //     }

    //     const createuser = await create_user.create(data);

    //     res.json({
    //         request : {
    //             ...req.body
    //         },
    //         response : {
    //             ...data,
    //         },
    //         statusCode : 1,
    //         message : "berhasil"
    //     })
    // } catch (error) {
    //     console.log('error.message', error.message);
    //     res.json({
    //       statusCode: 0,
    //       message: error.message
    //     });
    // }
  
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  
};

// Find a single Tutorial with an id
exports.findOne = (req, res) => {
  
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
  
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
  
};