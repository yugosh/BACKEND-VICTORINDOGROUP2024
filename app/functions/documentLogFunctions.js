const db = require("../models/index");
const document_log = db.document_log;

async function documentLogs(documentId, documentType, payload, response, requester) {
    try {
        const createDocumentLog = {
            document_id: documentId,
            document_type: documentType,
            payload: JSON.stringify(payload),
            response: response,
            requester: requester
        };

        const newDocumentLog = new document_log(createDocumentLog);
        const savedDocumentLog = await newDocumentLog.save();

        return savedDocumentLog;
    } catch (error) {
        console.error("An error occurred while creating document log:", error);
        throw error; // Throw error agar dapat ditangkap dan di-handle di luar fungsi
    }
}

module.exports = {
    documentLogs
};
