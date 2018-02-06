var bCrypt = require('bcrypt-nodejs');

module.exports = {
    getHash: function(password){
        return hash =  bCrypt.hashSync(password, bCrypt.genSaltSync(10));
    },
    isPasswordCorrect: function(userPassword, hash){
        return bCrypt.compareSync(userPassword, hash);
    }
};