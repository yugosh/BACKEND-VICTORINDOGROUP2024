const db = require("../models");
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');

const user_account = db.user_account;
const document_count = db.document_count;
const document_log = db.document_log;
const business_partner = db.business_partner;
const product = db.product;

//=============================================
// Settings - User
//=============================================
exports.createUser = async (req, res) => {
    try {
    //   const Post_Data = {
    //     username : this.dataUser.get('username')?.value,
    //     password : this.dataUser.get('password')?.value,
    //     user_data : {
    //       nama : this.dataUser.get('nama')?.value,
    //       nama_rekening : this.dataUser.get('nama_rekening')?.value,
    //       no_rekening : this.dataUser.get('no_rekening')?.value,
    //     },
    //     remark : this.dataUser.get('remark')?.value,
    //     role : this.dataUser.get('role')?.value,
    //   }

    const saltRounds = 10;

    let dataCreate = {
        ...req.body,
    }

    const checkUsername = await user_account.findOne({username:dataCreate['username']});
    // console.log("checkUsername", checkUsername);
    // console.log("dataCreate", dataCreate);

    if(checkUsername) {
        res.json({
            statusCode: 0,
            message: 'Username sudah terdaftar!'
        })
        return;
    }

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(dataCreate['password'], saltRounds, async function(err, hash) {
            // Store hash in your password DB.
            // console.log("hash", hash);
            // console.log("salt", salt);
            if(salt) {
                dataCreate['password'] = hash;
    
                //================================================================================================================================================
                // CREATE RUNNING NUMBER & DOCUMENT_ID NUMBER
                //================================================================================================================================================
                const document_condition = {
                    document_id: "create_user",
                    document_number: 0,
                }
    
                await document_count.updateOne(document_condition, { $inc: { count: 1 }, $set: { last_updated: moment().format() } }); // update document count dengan menambah 1
                const updatedDocument = await document_count.findOne(document_condition).catch(err => {
                    console.error("An error occurred:", err);
                }); // ambil kembali dokumen setelah update
    
                if (!updatedDocument) {
                    console.error("No document found with the given condition:", document_condition);
                    return;
                }

                // Simpan document_number sebagai document_id dalam dataCreate
                const date = new Date();
                const formattedDate = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getFullYear()).slice(-2)}`;
                
                dataCreate['document_id'] = "USER-" + formattedDate + "-" + updatedDocument.count;
                //================================================================================================================================================

                // console.log("dataCreate", dataCreate);
    
                //!CREATE USER
                await user_account.create(dataCreate); // Simpan dataCreate ke dalam database user_account

                //================================================================================================================================================
                // CREATE DOCUMENT LOG
                //================================================================================================================================================

                const createDocumentLog = {
                    document_id : "CREATE-USER",
                    document_type : 0,  //CREATE USER
                    payload : JSON.stringify(req.body),
                    response : {
                        ...dataCreate,
                    },
                    requester : {
                        username : req.body['username']
                    },
                }
        
                const updateDocumentLog = await document_log.create(createDocumentLog);
                //================================================================================================================================================
            }
        });
    });

    console.log("dataCreate", dataCreate);
    delete dataCreate['password'];
    res.json({statusCode : 1, message:"Berhasil Membuat Data!", data : dataCreate});
    } catch (error) {
        res.json({
          statusCode: 0,
          message: [error.message]
        })
    }
  
};

exports.updateUser = async (req, res) => {
    try {
        // const Post_Data = {
        //     condition : {
        //       username : element['username']
        //     }
        // }

        const condition = req.body.condition;
        const update = req.body.update;

        // Periksa apakah ada perubahan password
        if ('password' in update) {
            // Hash password baru sebelum menyimpannya
            const hashedPassword = await bcrypt.hash(update.password, 10);
            update.password = hashedPassword;
        }

        const updateUser = await user_account.findOneAndUpdate(condition, update, { new: true });

        if (updateUser) {
            res.json({statusCode: 1, message : 'Berhasil memperbarui user ' + updateUser.username + ' di database!' });
        } else {
            res.json({statusCode: 0, message : 'User tidak ditemukan.'});
        }
    } catch (error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        // const Post_Data = {
        //     condition : {
        //       username : element['username']
        //     }
        // }

        const condition = req.body.condition;

        const deleteUser = await user_account.findOneAndDelete(condition);

        if (deleteUser) {
            res.json({statusCode: 1, message : 'Berhasil menghapus data user ' + deleteUser.username + ' di database!'});
        } else {
            res.json({statusCode: 0, message : 'User tidak ditemukan.'});
        }

    } catch (error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        })
    }
}

exports.getUserData = async (req, res) => {
    try {
        // req.body = {
        //   condition: {
        //     menu_id: String,
        //     company_id: String
        //   }
        // };
        
        const user = await user_account.findOne(req.body['condition']);
        
        if (!user) {
            return res.json({ statusCode: 0, message: "User tidak ditemukan" });
        }

        const userData = {
            username: user.username,
            createdAt: user.createdAt,
            user_data: user.user_data,
            remark: user.remark,
            role: user.role,
            document_id: user.document_id,
            // last_ip: user.last_ip,
            // token: user.token,
        };

        res.json({statusCode: 1, message: "Berhasil Get Data User!", data: userData});
    } catch (error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        });
    }
};

exports.getUserDataList = async (req, res) => {
    try {
        // Ekstrak nilai dari request body
        const { condition, skip = 0, limit = 10 } = req.body;

        // Check if condition.name contains regex pattern
        if (condition.username) {
            condition.username = { $regex: condition.username, $options: 'i' };
        }

        // Inisialisasi array queryCondition untuk menampung berbagai tahap pipeline agregasi
        let queryCondition = [];

        // Menambahkan kondisi pencarian ke tahap $match dalam pipeline
        if (condition) {
            queryCondition.push({ $match: condition });
        }

        // Menambahkan tahap $sort, $skip, dan $limit ke dalam pipeline agregasi
        queryCondition.push(
            {
                $sort: {
                    _id: -1,
                },
            },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    password: 0 // Menghilangkan field password
                }
            }
        );

        // Log untuk debugging
        console.log("queryCondition:", queryCondition);

        // Melakukan agregasi untuk mendapatkan daftar user
        const userList = await user_account.aggregate(queryCondition).exec();

        // Menghitung total dokumen yang sesuai dengan kondisi pencarian
        const totalData = await user_account.countDocuments(condition);

        // Mengirim respons ke client
        res.json({
            statusCode: 1,
            message: "Berhasil Get Data User!",
            data: userList,
            total_data: totalData
        });
    } catch (error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        });
    }
};
//=============================================

exports.getDocumentLogs = async (req, res) => {
    try {
        const condition = req.body.condition; // Mendapatkan kondisi untuk pencarian user

        const documentLogs_data = await document_log.find(condition).sort({ createdAt: -1 }).limit(10);

        if (documentLogs_data.length > 0) { // Periksa apakah panjang array lebih dari 0
            // Jika data ditemukan, kirim respon dengan data
            console.log("documentLogs_data", documentLogs_data);
            res.json({ statusCode: 1, data: documentLogs_data, message: 'Berhasil mendapatkan data!' });
        } else {
            // Jika data tidak ditemukan, kirim respon dengan pesan bahwa data tidak ditemukan
            res.json({ statusCode: 0, message: "Data tidak ditemukan!", data: null });
        }
    } catch (error) {
        // Tangani kesalahan yang terjadi
        res.json({ statusCode: 0, message: error.message });
    }
}

exports.getDocumentLogsList = async (req, res) => {
    try {
        const condition = req.body.condition; // Mendapatkan kondisi untuk pencarian user

        if ('createdAt' in condition) {
            const { $gte, $lte } = condition['createdAt'];
        
            // Buat objek `Date` untuk `$gte` dan `$lte`
            const startDate = new Date($gte);
            const endDate = new Date($lte);

            // Atur kembali kondisi pencarian `createdAt` dengan objek `Date` yang baru
            condition['createdAt'] = {
                $gte: startDate,
                $lte: endDate
            };
        }
        
        console.log("condition", condition);

        // Lakukan agregasi dengan kondisi yang telah diperbarui
        db['document_log'].aggregate([
            { 
                $match: condition
            },
            {
                $sort : {created_time : 1}
            }
        ]).exec((err, result) => {
            if (err){
                res.json({statusCode: 0, message: err.message});
                return;
            }
            
            res.json({statusCode: 1, data: result});
        });

    } catch (error) {
        // Tangani kesalahan yang terjadi
        res.json({ statusCode: 0, message: error.message });
    }
}

exports.getDocumentCount = async (req, res) => {
    try {

        const totalDataUser = await user_account.countDocuments();
        const totalDataDocument = await document_log.countDocuments();
        const totalDataPartners = await business_partner.countDocuments();
        const totalDataProduct = await product.countDocuments();

    
        res.json({
            statusCode: 1, 
            message: "Berhasil Get Data!", 
            totalDataUser: totalDataUser,
            totalDataDocument: totalDataDocument,
            totalDataPartners: totalDataPartners,
            totalDataProduct: totalDataProduct
        });
    } catch (error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        });
    }
};