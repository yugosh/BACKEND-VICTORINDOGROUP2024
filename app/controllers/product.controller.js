const db = require("../models");
const { generateDocumentId } = require('../functions/runningNumberFunctions');
const { documentLogs } = require('../functions/documentLogFunctions');
const product = db.product;

exports.createProducts = async (req, res) => {
    try {
        const documentId = await generateDocumentId("create_product", "PRODUCT", 0);

        if (!documentId) {
            return res.json({
                statusCode: 0,
                message: "Gagal membuat produk. Terjadi kesalahan dalam menghasilkan document ID."
            });
        }

        const {
            url_image,
            name,
            description,
            price,
            quantity,
            type,
            sku,
            category,
            status,
        } = req.body;

        const newProduct = new product({
            url_image : url_image,
            name: name,
            sku: sku,
            description: description,
            price: price,
            quantity: quantity,
            type: type,
            category: category,
            status: status,
            created_by: req.dataUser._id, // Ambil ID user dari middleware auth
            document_id: documentId // Adding document_id to the new product
        });

        const savedProduct = await newProduct.save();

        const createDocumentLog = {
            document_id: "CREATE-PRODUCTS",
            document_type: 10,
            payload: req.body,
            response: savedProduct,
            requester: {
                username: req.dataUser.username // Ambil username dari middleware auth
            }
        };

        const savedDocumentLog = await documentLogs(createDocumentLog.document_id, createDocumentLog.document_type, createDocumentLog.payload, createDocumentLog.response, createDocumentLog.requester);

        res.json({
            statusCode: 1,
            message: "Produk berhasil dibuat!",
            data: savedProduct
        });

    } catch (error) {
        res.json({
          statusCode: 0,
          message: [error.message]
        })
    }
};

exports.updateProducts = async (req, res) => {
    try {
        const condition = req.body.condition;
        const update = req.body.update;

        update['updated_by'] = req.dataUser._id;

        const updatedProduct = await product.findOneAndUpdate(condition, update, { new: true });

        if (updatedProduct) {
            res.json({statusCode: 1, message : 'Berhasil memperbarui produk ' + updatedProduct.name + ' di database!' });
        } else {
            res.json({statusCode: 0, message : 'Produk tidak ditemukan.'});
        }

        const createDocumentLog = {
            document_id: "EDIT-PRODUCTS",
            document_type: 11,
            payload: req.body,
            response: updatedProduct,
            requester: {
                username: req.dataUser.username // Ambil username dari middleware auth
            }
        };

        const savedDocumentLog = await documentLogs(createDocumentLog.document_id, createDocumentLog.document_type, createDocumentLog.payload, createDocumentLog.response, createDocumentLog.requester);

    } catch (error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        })
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const condition = req.body.condition;

        const deleteProduct = await product.findOneAndDelete(condition);

        if (deleteProduct) {
            res.json({statusCode: 1, message : 'Berhasil menghapus produk ' + deleteProduct.name + ' dari database!'});
        } else {
            res.json({statusCode: 0, message : 'Produk tidak ditemukan.'});
        }

        const createDocumentLog = {
            document_id: "DELETE-PRODUCTS",
            document_type: 12,
            payload: req.body,
            response: deleteProduct,
            requester: {
                username: req.dataUser.username // Ambil username dari middleware auth
            }
        };

        const savedDocumentLog = await documentLogs(createDocumentLog.document_id, createDocumentLog.document_type, createDocumentLog.payload, createDocumentLog.response, createDocumentLog.requester);

    } catch (error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        });
    }
}

exports.getProductsData = async (req, res) => {
    try {
        const condition = req.body.condition;

        const productData = await product.findOne(condition);

        if (productData) {
            res.json({statusCode: 1, message : 'Berhasil mendapatkan data produk!', data: productData});
        } else {
            res.json({statusCode: 0, message : 'Produk tidak ditemukan.'});
        }

    } catch (error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        });
    }
}


exports.getProductsDataList = async (req, res) => {
    try {
        const condition = req.body.condition || {};
        const skip = req.body.skip || 0;
        const limit = req.body.limit || 10;

        if (condition.type && Array.isArray(condition.type)) {
            const typeValues = condition.type.map(typeObj => typeObj.value);
            condition.type = { $in: typeValues };
        }

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
        const results = await product.aggregate(pipeline);

        // Mendapatkan data produk dan total data dari hasil agregasi
        const productList = results[0].data;
        const totalData = results[0].totalData.length > 0 ? results[0].totalData[0].count : 0;

        res.json({
            statusCode: 1,
            message: "Berhasil mendapatkan daftar produk!",
            data: productList,
            total_data: totalData
        });

    } catch (error) {
        res.json({
            statusCode: 0,
            message: [error.message]
        });
    }
}