const bcrypt = require("bcrypt");

bcrypt.hash("pedrolopescantor", 10).then((hash) => {
  console.log(hash);
});
