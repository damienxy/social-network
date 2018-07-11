const fs = require("fs");
const knox = require("knox");

// ********** START Create client via knox ********** //
let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env;
} else {
    secrets = require("./secrets");
}
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: "spicedling"
});
// ********** END Create client via knox ********** //

exports.upload = function(req, res, next) {
    if (!req.file) {
        console.log("No file in request object");
        return res.status(500).send({
            message: "No file chosen"
        });
    }
    const s3Request = client.put(req.file.filename, {
        "Content-Type": req.file.mimetype,
        "Content-Length": req.file.size,
        "x-amz-acl": "public-read"
    });
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on("response", s3Response => {
        if (s3Response.statusCode == 200) {
            fs.unlink(req.file.path, () => {
                console.log(
                    "File removed from harddrive after successful upload"
                );
            });
            next();
        } else {
            res.status(500).send({
                message: "Upload failed"
            });
        }
    });
};
