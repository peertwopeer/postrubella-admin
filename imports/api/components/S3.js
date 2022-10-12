import AWS from "aws-sdk";

// S3 Configuration
const spacesEndpoint = new AWS.Endpoint("ams3.digitaloceanspaces.com");

// folder paths

// logos folder
var spacesFolderLogo = "postrubella/public/logos";

// barcodes folder
var spacesFolderBarcode = "postrubella/barcodes";

// signatures folder
var spacesFolderSignatures = "postrubella/signatures";

//check env
if (Meteor.absoluteUrl().includes("localhost")) {
  spacesFolderLogo = "postrubella/public/logos/dev";
  spacesFolderBarcode = "postrubella/tmp/barcodes";
  spacesFolderSignatures = "postrubella/tmp/signatures";
}
if (Meteor.absoluteUrl().includes("dev-admin.postrubella.io")) {
  spacesFolderLogo = "postrubella/public/logos/dev";
  spacesFolderBarcode = "postrubella/tmp/barcodes";
  spacesFolderSignatures = "postrubella/tmp/signatures";
}

const S3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: Meteor.settings.private.spaces.ACCESS_KEY,
  secretAccessKey: Meteor.settings.private.spaces.SECRET_KEY,
});

export { spacesFolderLogo };
export { spacesFolderBarcode };
export { spacesFolderSignatures };
export { S3 };
