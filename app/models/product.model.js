module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            url_image : String,
            document_id: { type: String, unique: true, required: true},
            name: { type: String, required: true },
            description: { type: String },
            price: { type: Number, required: true },
            quantity: { type: Number, default: 0 },
            type: { type: Number, enum: [0, 1, 2], default: 0 , required: true},  // 0: Item Jual, 1: Item Assembly, 2: Item Asset
            sku: { type: String, unique: true, required: true },
            category: { type: String },
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

    const product = mongoose.model("product", schema);
    return product;
};
