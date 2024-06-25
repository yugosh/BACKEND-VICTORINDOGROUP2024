const moment = require('moment');
const db = require("../models/index");
const document_count = db.document_count;

async function generateDocumentId(docType, prefix, initialCount) {
    try {
        const document_condition = {
            document_id: docType,
            document_number: initialCount,
        };

        await document_count.updateOne(document_condition, { $inc: { count: 1 }, $set: { last_updated: moment().format() } });
        const updatedDocument = await document_count.findOne(document_condition).catch(err => {
            console.error("An error occurred:", err);
        });

        if (!updatedDocument) {
            console.error("No document found with the given condition:", document_condition);
            return null;
        }

        const date = new Date();
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getFullYear()).slice(-2)}`;

        return `${prefix}-${formattedDate}-${updatedDocument.count}`;
    } catch (error) {
        console.error("An error occurred while generating document ID:", error);
        return null;
    }
}

module.exports = {
    generateDocumentId
};
