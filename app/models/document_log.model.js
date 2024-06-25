module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            document_type: Number,
            document_id: String,
            payload: {
                type: Object,  // Tipe data Object
                default: {}    // Nilai default adalah objek kosong
            },
            response: {
                type: Object,  // Tipe data Object
                default: {}    // Nilai default adalah objek kosong
            },
            requester : {
                username : String,
                nama : String,
                email : String,
                role : Number,
            },
        },
        { timestamps: true }
    );

    //=============
    //0 : Create User;
    //1 : Edit User;
    //2 : Delete User;

    //10 : Create Product;
    //11 : Edit Product;
    //12 : Delete Product;

    //20 : Create Business Partner;
    //21 : Edit Business Partner;
    //22 : Delete Business Partner;

    //998 : Login
    //999 : Logouts

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const document_log = mongoose.model("document_log", schema);
    return document_log;
};