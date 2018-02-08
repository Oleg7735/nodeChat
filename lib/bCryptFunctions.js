var bCrypt = require('bcrypt-nodejs');

module.exports = {
    getHash: function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10));
    },
    isPasswordCorrect: function(userPassword, hash){
        try {
            return bCrypt.compareSync(userPassword, hash);
        }catch (error){
            return false;
        }
    }
};