module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            document_type: Number,
            document_id: String,
            document_number : Number,
            count: Number,
            last_updated: Date,
            date: Number,
            month: Number,
            year: Number,
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const document_count = mongoose.model("document_count", schema);
    return document_count;
};