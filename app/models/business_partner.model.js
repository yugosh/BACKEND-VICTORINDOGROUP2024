module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            document_id : { type: String, required: true },
            name: { type: String, required: true },
            address: { type: String, required: true },
            contact_info: {
                email: { type: String, required: true },
                phone: { type: String, required: true },
            },
            type: { type: Number, enum: [0, 1, 2], required: true },  // 0: Customer, 1: Supplier, 2: Affiliate
            status: { type: Number, enum: [0, 1], default: 1 },  // 0: inactive, 1: active
            created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'user_account' },
            updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'user_account' },
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const BusinessPartner = mongoose.model("BusinessPartner", schema);
    return BusinessPartner;
};
