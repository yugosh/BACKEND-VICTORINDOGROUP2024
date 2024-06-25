const db = require("../models");
const business_partner = db.business_partner;
const { generateDocumentId } = require('../functions/runningNumberFunctions');
const { documentLogs } = require('../functions/documentLogFunctions');

exports.createBusinessPartner = async (req, res) => {
    try {
        const documentId = await generateDocumentId("create_business_partner", "BUSINESS_PARTNER", 0);

        if (!documentId) {
            return res.json({
                statusCode: 0,
                message: "Gagal membuat business partner. Terjadi kesalahan dalam menghasilkan document ID."
            });
        }

        const newBusinessPartner = new business_partner({
            name: req.body.name,
            address: req.body.address,
            contact_info: {
                email: req.body.contact_info.email,
                phone: req.body.contact_info.phone,
            },
            type: req.body.type,
            status: req.body.status,
            created_by: req.dataUser._id, // Ambil ID user dari middleware auth
            document_id: documentId,
        });

        const savedBusinessPartner = await newBusinessPartner.save();

        const createDocumentLog = {
            document_id: "CREATE-BUSINESS-PARTNER",
            document_type: 20, // Sesuaikan dengan jenis log yang Anda miliki
            payload: req.body,
            response: savedBusinessPartner,
            requester: {
                username: req.dataUser.username // Ambil username dari middleware auth
            },
        };

        const savedDocumentLog = await documentLogs(createDocumentLog.document_id, createDocumentLog.document_type, createDocumentLog.payload, createDocumentLog.response, createDocumentLog.requester);

        res.json({
            statusCode: 1,
            message: "Business partner berhasil dibuat!",
            data: savedBusinessPartner
        });

    } catch (error) {
        res.json({
            statusCode: 0,
            message: error.message
        });
    }
};


exports.updateBusinessPartner = async (req, res) => {
    try {
        const condition = req.body.condition;
        const update = req.body.update;

        update['updated_by'] = req.dataUser._id;

        const updatedBusinessPartner = await business_partner.findOneAndUpdate(condition, update, { new: true });

        if (updatedBusinessPartner) {
            res.json({ statusCode: 1, message: `Berhasil memperbarui business partner ${updatedBusinessPartner.name} di database!` });
        } else {
            res.json({ statusCode: 0, message: 'Business partner tidak ditemukan.' });
        }

        const createDocumentLog = {
            document_id: "EDIT-BUSINESS-PARTNER",
            document_type: 21, // Sesuaikan dengan jenis log yang Anda miliki
            payload: req.body,
            response: updatedBusinessPartner,
            requester: {
                username: req.dataUser.username // Ambil username dari middleware auth
            },
        };

        const savedDocumentLog = await documentLogs(createDocumentLog.document_id, createDocumentLog.document_type, createDocumentLog.payload, createDocumentLog.response, createDocumentLog.requester);

    } catch (error) {
        res.json({
            statusCode: 0,
            message: error.message
        });
    }
};

exports.deleteBusinessPartner = async (req, res) => {
    try {
        const condition = req.body.condition;

        const deletedBusinessPartner = await business_partner.findOneAndDelete(condition);

        if (deletedBusinessPartner) {
            res.json({ statusCode: 1, message: `Berhasil menghapus business partner ${deletedBusinessPartner.name} dari database!` });
        } else {
            res.json({ statusCode: 0, message: 'Business partner tidak ditemukan.' });
        }

        const createDocumentLog = {
            document_id: "DELETE-BUSINESS-PARTNER",
            document_type: 22, // Sesuaikan dengan jenis log yang Anda miliki
            payload: req.body,
            response: deletedBusinessPartner,
            requester: {
                username: req.dataUser.username // Ambil username dari middleware auth
            },
        };

        const savedDocumentLog = await documentLogs(createDocumentLog.document_id, createDocumentLog.document_type, createDocumentLog.payload, createDocumentLog.response, createDocumentLog.requester);

    } catch (error) {
        res.json({
            statusCode: 0,
            message: error.message
        });
    }
};

exports.getBusinessPartnerData = async (req, res) => {
    try {
        const condition = req.body.condition || {};

        // Check if condition.name contains regex pattern
        if (condition.name) {
            condition.name = { $regex: condition.name, $options: 'i' };
        }

        const businessPartner = await business_partner.findOne(condition);

        if (businessPartner) {
            res.json({
                statusCode: 1,
                message: "Berhasil mendapatkan data business partner!",
                data: businessPartner
            });
        } else {
            res.json({
                statusCode: 0,
                message: 'Business partner tidak ditemukan.'
            });
        }
    } catch (error) {
        res.json({
            statusCode: 0,
            message: error.message
        });
    }
};

exports.getBusinessPartnerDataList = async (req, res) => {
    try {
        const condition = req.body.condition || {};
        const skip = req.body.skip || 0;
        const limit = req.body.limit || 10;

        // Check if condition.name contains regex pattern
        if (condition.name) {
            condition.name = { $regex: condition.name, $options: 'i' };
        }

        // Membuat pipeline agregasi
        const pipeline = [
            { $match: condition },
            { $skip: skip },
            { $limit: limit },
            {
                $facet: {
                    data: [
                        { $match: condition },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalData: [
                        { $match: condition },
                        { $count: "count" }
                    ]
                }
            }
        ];

        // Menjalankan pipeline agregasi
        const results = await business_partner.aggregate(pipeline);

        // Mendapatkan data produk dan total data dari hasil agregasi
        const productList = results[0].data;
        const totalData = results[0].totalData.length > 0 ? results[0].totalData[0].count : 0;

        res.json({
            statusCode: 1,
            message: "Berhasil mendapatkan daftar business partner!",
            data: productList,
            total_data: totalData
        });

    } catch (error) {
        res.json({
            statusCode: 0,
            message: error.message
        });
    }
};