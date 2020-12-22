const jwt = require('jsonwebtoken');
const UserModel = require('../models/user-model');


const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'deasamniashvili');
        const user = await UserModel.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }

        console.log('test');

        req.token = token;
        req.user = user
        next()

    } catch (error) {
        res.status(401).send('Error: Please authenticate.')
    }

}

module.exports = auth;