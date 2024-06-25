module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            username: { type: String, unique: true, required: true },
            password: String,
            token: String,
            document_id : String,
            user_data : {
                nama : String,
                email : String,
                contact_no : String,
                address : String,
            },
            remark : String,
            role : Number,  //0: User, 1:Admin, 2: Custom
            status: { type: Number, default: 1 }, //0: Inactive, 1: Active
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

    const user_account = mongoose.model("user_account", schema);
    return user_account;
};