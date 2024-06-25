const db = require("../models");
const accounts = db.accounts;
const user_account = db.user_account;
const transaction = db.transaction;
const document_count = db.document_count;
const document_log = db.document_log;

const moment = require('moment-timezone');

//=============================================
// Settings - BANK
//=============================================
exports.createBankAccount = async (req, res) => {
    try {
        // const Post_Data = {
        //     accounts_name : this.dataCreateAccount.get('account_name')?.value,
        //     account_code : this.dataCreateAccount.get('account_code')?.value,
        //     account_type : this.dataCreateAccount.get('account_type')?.value,
        //     account_bank : this.dataCreateAccount.get('account_bank')?.value,
        //     description : this.dataCreateAccount.get('description')?.value,
        //     remark : this.dataCreateAccount.get('remark')?.value,
        //     balance : this.dataCreateAccount.get('balance')?.value,
        //     status : this.dataCreateAccount.get('status')?.value,
        //     requester : {
        //       created_time : moment(),
        //       username : this.mainconfig.userdata.username,
        //       nama : this.mainconfig.userdata.user_data.nama,
        //       email : this.mainconfig.userdata.user_data.email,
        //     }
        // }

        console.log("req.body", req.body);
        
        //==============================================================================
        // CHECK USER ACCOUNT
        //==============================================================================
        const condition_user = {
            username: req.body['requester']['username'],
        }

        const userList = await user_account.findOne(condition_user);
        console.log("userList", userList);

        // if (userList && userList['role'] !== 1) {
        //     res.json({
        //         statusCode: 0,
        //         message: "Kamu bukan Master!"
        //     })
        //     return;
        // }

        //==============================================================================
        // UPDATE ACCOUNTS ID
        //==============================================================================
        
        const document_condition = {
            document_id: "accounts",
            document_number: req.body['accounts_type'], //0: Bank, 1: eWallet, 2: Pulsa, 3: QRIS,
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

        switch(req.body['accounts_type']) {
            case 0 :
                req.body['accounts_id'] = "BANK-" + updatedDocument.count;
            break;

            case 1 :
                req.body['accounts_id'] = "EWALLET-" + updatedDocument.count;
            break;

            case 2 :
                req.body['accounts_id'] = "PULSA-" + updatedDocument.count;
            break;

            case 3 :
                req.body['accounts_id'] = "QRIS-" + updatedDocument.count;
            break;
        }

        //==============================================================================
        // CREATE TRANSACTION
        //==============================================================================

        const create_saldoawal_transaction = {
            description : "SALDO AWAL - " + req.body['accounts_name'] + " (" + req.body['accounts_code'] + ")",
            transaction_date : moment(),
            transaction_type : 2,   //saldo awal

            balance : req.body['balance'],
            deposit_amount : req.body['balance'],
            withdrawl_amount : 0,

            accounts : {
                accounts_id : req.body['accounts_id'],
                accounts_name : req.body['accounts_name'],
                accounts_code : req.body['accounts_code'],
                accounts_type : req.body['accounts_type'],
                accounts_type_variant : req.body['accounts_type_variant'],
                accounts_data : req.body['accounts_data'],
            },
            status : 2,
        }

        //==============================================================================
        // CREATE TRANSACTION ID
        //==============================================================================
        const document_condition2 = {
            document_id: "transaction",
            document_number: 0, // DEPOSIT/SALDOAWAL
        }

        await document_count.updateOne(document_condition2, { $inc: { count: 1 }, $set: { last_updated: moment().format() }}); // update document count dengan menambah 1
        const updatedDocument2 = await document_count.findOne(document_condition2).catch(err => {
            console.error("An error occurred:", err);
        }); // ambil kembali dokumen setelah update

        if (!updatedDocument2) {
            console.error("No document found with the given condition:", document_condition2);
            return;
        }

        create_saldoawal_transaction['transaction_id'] = "TR-" + formattedDate + "-" + updatedDocument2.count;

        //==============================================================================
        await transaction.create(create_saldoawal_transaction); 
        //==============================================================================
        await accounts.create(req.body); // Simpan dataCreate ke dalam database accounts

        //==============================================================================

        const createDocumentLogTransaction = {
            document_id : create_saldoawal_transaction['transaction_id'],
            document_type : 3,  //TRANSACTION
            payload : JSON.stringify(req.body),
            response : {
                create_saldoawal_transaction
            },
            requester : {
                username : req.body['requester']['username'],
                nama : req.body['requester']['nama'],
                role : req.body['requester']['role'],
            },
        }

        const createDocumentLogAccounts = {
            document_id : req.body['accounts_id'],
            document_type : 2,  //TRANSACTION
            payload : JSON.stringify(req.body),
            response : {
                ...req.body
            },
            requester : {
                username : req.body['requester']['username'],
                nama : req.body['requester']['nama'],
                role : req.body['requester']['role'],
            },
        }

        const updateDocumentLogTransaction = await document_log.create(createDocumentLogTransaction);
        const updateDocumentLogAccounts = await document_log.create(createDocumentLogAccounts);

        res.json({ statusCode: 1, data: req.body });
    } catch (error) {
        res.json({
            statusCode: 0,
            message: [error.message],
            stack: error.stack // Hanya untuk debugging, jangan gunakan di produksi
        })
    }
};

exports.editBankAccount = async (req, res) => {
    try {
        // const Post_Data = {
        //     accounts_id : ada
        //     accounts_name : this.dataCreateAccount.get('account_name')?.value,
        //     account_code : this.dataCreateAccount.get('account_code')?.value,
        //     account_type : this.dataCreateAccount.get('account_type')?.value,
        //     account_bank : this.dataCreateAccount.get('account_bank')?.value,
        //     description : this.dataCreateAccount.get('description')?.value,
        //     remark : this.dataCreateAccount.get('remark')?.value,
        //     balance : this.dataCreateAccount.get('balance')?.value,
        //     status : this.dataCreateAccount.get('status')?.value,
        //     requester : {
        //       created_time : moment(),
        //       username : this.mainconfig.userdata.username,
        //       nama : this.mainconfig.userdata.user_data.nama,
        //       email : this.mainconfig.userdata.user_data.email,
        //     }
        // }

        const conditionBankAccount = {
            accounts_id : req.body['condition']['accounts_id'],
        }

        const updateBankAccount = {
            ...req.body['update']
        }

        const options = {new : true};

        const updateBank = await accounts.findOneAndUpdate(conditionBankAccount, updateBankAccount, options);

        if (!updateBank) {
            // Dokumen dengan kondisi tersebut tidak ditemukan
            res.json({
                statusCode: 0,
                message: "Gagal update database Accounts!"
            });

            return;
        }

        res.json({statusCode : 1, data : updateBank});
    } catch(error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        })
    }
}

exports.disableStatusAccount = async (req, res) => {
    try {
        // const Post_Data = {
        //     condition : {
        //       accounts_id : data['accounts_id']
        //     },
        //     update : {
        //       status : 99 //disabled
        //     }
        // }

        const conditionBankAccount = {
            accounts_id : req.body['condition']['accounts_id'],
        }

        const updateBankAccount = {
            ...req.body['update']
        }

        const options = {new : true};

        const updateBank = await accounts.findOneAndUpdate(conditionBankAccount, updateBankAccount, options);

        if (!updateBank) {
            // Dokumen dengan kondisi tersebut tidak ditemukan
            res.json({
                statusCode: 0,
                message: "Gagal update database Accounts!"
            });

            return;
        }

        res.json({statusCode : 1, data : updateBank});
    } catch(error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        })
    }
}

exports.getBankAccount = async (req, res) => {
    try {
        console.log("req.body", req.body);

        // Ekstrak nilai dari request body
        const { intercept_request, condition, skip = 0, limit = 10 } = req.body;

        // Modifikasi query berdasarkan kondisi yang diberikan
        let queryCondition = [];
        if (condition && 'accounts_type' in condition) {
            queryCondition.push({ $match: { 'accounts_type': condition.accounts_type } });
        }

        if (condition && 'status' in condition) {
            queryCondition.push({ $match: { 'status': condition.status } });
        }

        // Menambahkan skip dan limit ke dalam pipeline agregasi
        queryCondition.push(
            { $skip: skip },
            { $limit: limit }
        );

        console.log("queryCondition", queryCondition);

        // Melakukan pencarian dan menghitung total dokumen
        const accountsList = await accounts.aggregate(queryCondition).exec();
        
        // Tambahkan logika untuk memeriksa dan memperbarui status akun dana
        for (const account of accountsList) {
            if (account.accounts_type === 1 && account.accounts_type_variant === 2) {
                if (account.accumulated_balance >= (0.9 * 40000000)) { // 90% dari 40 juta
                    // Gunakan metode `updateOne` untuk memperbarui status
                    await accounts.updateOne({ _id: account._id }, { status: 0 });
                }
            }
        }

        const totalCount = await accounts.countDocuments(condition || {});

        // Kirim respons
        res.json({
            statusCode: 1,
            data: accountsList,
            total: totalCount
        });
    } catch (error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        });
    }
};


exports.getAllBankAccount = async (req, res) => {
    try {
        console.log("req.body", req.body);

        // Extract values from the request body
        const { intercept_request, condition } = req.body;

        // Initialize query conditions array
        let queryCondition = [];

        // Modify the query based on the provided condition for 'accounts_type'
        if (condition && 'accounts_type' in condition) {
            queryCondition.push({ $match: { 'accounts_type': condition.accounts_type } });
        }

        if (condition && 'status' in condition) {
            queryCondition.push({ $match: { 'status': condition.status } });
        }

        // If no conditions, add a default $match to get all
        if (queryCondition.length === 0) {
            queryCondition.push({ $match: {} });
        }

        console.log("queryCondition", queryCondition);

        // Perform the search and count the total documents
        const accountsList = await accounts.aggregate(queryCondition).exec();
        
        // Tambahkan logika untuk memeriksa dan memperbarui status akun
        for (const account of accountsList) {
            if (account.accounts_type === 1 && account.accounts_type_variant === 2) {
                if (account.accumulated_balance >= (0.9 * 40000000)) { // 90% dari 40 juta
                    // Gunakan metode `updateOne` untuk memperbarui status
                    await accounts.updateOne({ _id: account._id }, { status: 0 });
                }
            }
        }

        const totalCount = await accounts.countDocuments(condition || {});

        // Send the response
        res.json({
            statusCode: 1,
            data: accountsList,
            total: totalCount
        });

    } catch (error) {
        // Send error response
        res.json({
            statusCode: 0,
            message: [error.message]
        });
    }
};

exports.getMultiBankAccount = async (req, res) => {
    try {
        // const Post_Data = {
        //     condition: {
        //       accounts_id: {
        //         $in: accountsIdArray,
        //       },
        //       status: 1,
        //     }
        // };

        const condition = req.body.condition;

        const dataAccounts = await accounts.find(condition);

        res.json({
            statusCode: 1,
            data : dataAccounts,
        });

    } catch(err) {
        res.json({
            statusCode: 0,
            message: [err.message]
        });
    }
}

exports.editStatusBankAccount = async (req, res) => {
    try {
        // const Post_Data = {
        //     condition : {
        //       accounts_id : element['accounts_id'],
        //       accounts_code : element['accounts_code'],
        //       accounts_name : element['accounts_name'],
        //       accounts_type : element['accounts_type'],
        //       accounts_type_variant : element['accounts_type_variant'],
        //     },
        //     update : {
        //       status : element['status'] === 0 ? 1:0,
        //     }
        // }

        const conditionBankAccount = {
            ...req.body['condition']
        }

        const updateBankAccount = {
            ...req.body['update']
        }

        const options = {new : true};

        const updateBank = await accounts.findOneAndUpdate(conditionBankAccount, updateBankAccount, options);

        if (!updateBank) {
            // Dokumen dengan kondisi tersebut tidak ditemukan
            res.json({
                statusCode: 0,
                message: "Gagal update database Accounts!"
            });

            return;
        }

        const createDocumentLog = {
            document_id : req.body['condition']['accounts_id'],
            document_type : 2,  //TRANSACTION
            payload : JSON.stringify(req.body),
            response : {
                ...updateBank,
            },
            requester : {
                username : req.body['username']
            },
        }

        const updateDocumentLog = await document_log.create(createDocumentLog);

        res.json({statusCode : 1, data : updateBank});

    } catch(err) {
        res.json({
            statusCode: 0,
            message: [err.message]
        });
    }
}


//=============================================