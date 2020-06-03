const { admin } = require('./admin');

// Firebase Authentication Middleware to Check User is logged in and has appropriate token
module.exports = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found.')
        return res.status(403).json({ error : 'Unauthorized'})
    }

    admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            req.user = decodedToken;
            console.log('this is the Decoded Token: ', decodedToken);
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then((data)=> {
            req.user.handle = data.docs[0].data().handle;
            return next(); // let code move on to (req, res function on post/get requests)
        })
        .catch((err) => {
            console.error('Error while verifying token: ', err)
            return res.status(403).json(err);
        })
};
