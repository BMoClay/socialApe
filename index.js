const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')(); 

admin.initializeApp();

const firebaseConfig = {
    apiKey: "AIzaSyCVWlbm5sRU6cfODcQyp35YWlAMnlU9eqk",
    authDomain: "socialape-4e614.firebaseapp.com",
    projectId: "socialape-4e614",
    storageBucket: "socialape-4e614.appspot.com",
    messagingSenderId: "451805626133",
    appId: "1:451805626133:web:bae950ab927605099c331c",
    measurementId: "G-D5B1R1W9RC"
  };

// const firebase = require('firebase');
// firebase.initializeApp(firebaseConfig);

const db = admin.firestore();


app.get('/screams', (req, res) => {
    // admin
    //     .firestore()
    db
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let screams = [];
            data.forEach((doc) => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body, //could probably do ...doc.data() instead of this but this is node 6 so we can't but maybe come back and refactor w spread operator later on
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount
                });
            });
            return res.json(screams);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code })
        });
});

// Post one scream
app.post('/scream', (req, res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({ body: 'Body must not be empty' });
    }

    const newScream = {
       body: req.body.body,
       userHandle: req.body.userHandle,
       createdAt: new Date().toISOString()
    };

    // admin
    //     .firestore()
    db
        .collection('screams')
        .add(newScream)
        .then((doc) =>{
            res.json({ message: `document ${doc.id} created successfully` });
        })
        .catch((err) => {
            res.status(500).json({ error: 'sointhibng wnet wrong' });
            console.error(err);
        });
}); // https://baseurl.com/screams // no // https://baseurl.com/api/ // yes

// Signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPasword: req.body.confirmPasword,
        handle: req.body.handle,
    };

    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ handle: 'this handle is already taken' });
            } else {
               return admin //firebase
        .auth()
        // .createUserWithEmailAndPassword(newUser.email, newUser.password)
        .createUser({
            email: newUser.email, 
            // emailVerified: false,
            password: newUser.password,
        })
            }
        })
        .then(data => {
            console.log(data)
            return data.user.user.getIdToken();
        })
        .then(token => {
            return res.status(201).json({ token });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code })
        });
    // return admin.auth().createUser({ email, password }).then((userRecord) => {
    //     return res.send(`Created user ${userRecord.uid}`)
    // })
    
    // TODO: validate data
    // firebase
    // admin
    //     .auth()
    //     // .createUserWithEmailAndPassword(newUser.email, newUser.password)
    //     .createUser({
    //         email: newUser.email, 
    //         // emailVerified: false,
    //         password: newUser.password,

    //     })
    //     .then((data) => {
    //         return res
    //             .status(201) //.json({ message: `user ${data.user.uid} signed up successfully` });
    //             .json({ message: `user ${data.uid} signed up successfully` });
    //     })
    //     .catch((err) => {
    //         console.error(err);
    //         return res.status(500).json({ error: err.code })
    //     });
});

exports.api = functions.https.onRequest(app);