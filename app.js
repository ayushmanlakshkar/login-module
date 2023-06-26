const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const users = require('./usermodel');

// PUT MONGODB DATABASE URL HERE
url=''


const mongoDbURI = url
mongoose.connect(mongoDbURI)
    .then(() => console.log('connected'))
    .catch(() => console.log('error'));

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let usercredentials = {};

app.get('/sing_in', async function (req, res) {
    res.render('sing_in');
})

app.get('/sing_up', async function (req, res) {
    res.render('sing_up');
})


app.get('/user', async function (req, res) {
    res.render('user', { usercredentials });
})

app.get('/delete', async function (req, res) {
    res.render('delete_user');
})

app.get('/edit', async function (req, res) {
    res.render('edit');
})


app.post("/sing_in", async (req, res) => {
    let user = await users.findOne({ password: req.body.password }).where({ phoneno: req.body.phoneno })
    if (await users.findOne({ phoneno: req.body.phoneno }).lean()) {
        if (user) {
            console.log('user singed in');
            usercredentials = {
                username: user.username,
                phoneno: user.phoneno,
                password: user.password
            }
            res.send({ redirectUrl: '/user' });
        }
        else {
            console.log('wrong password')
            res.status(400).send('wrong password');

        }
    }
    else {
        console.log('enter valid phone no')
        res.status(400).send('enter valid phone no');

    }
});

app.post("/sing_up", async (req, res) => {
    if (await users.findOne({ phoneno: req.body.phoneno }).lean()) {
        res.status(400).send('phone number already exist');
    }
    else {
        users.create({ username: req.body.username, phoneno: req.body.phoneno, password: req.body.password })
            .then(() => {
                console.log('user saved');
                res.send('user saved');
            })
            .catch(() => {
                console.log('user not saved');
                res.status(500).send('user cannot be saved');
            });
    }

});


app.post("/delete", async (req, res) => {
    console.log(req.body.password, usercredentials.phoneno)
    if (await users.findOne({ password: req.body.password }).where({ phoneno: usercredentials.phoneno })) {
        console.log('user deleted successfully');
        await users.deleteOne({ phoneno: usercredentials.phoneno }).then(() => {
            res.send({ redirectUrl: '/sing_in' });

        }).catch(() => {
            res.status(400).send('user couldnt get deleted successfully');
        });

    }
    else {
        console.log('wrong password ')
        res.status(400).send('wrong password for given phone no');

    }
}

);


app.post('/edit', async (req, res) => {
    let change = await users.findOne({ phoneno: usercredentials.phoneno });
    let id = change._id;
    if (req.body.oldpassword == usercredentials.password) {
        if (req.body.username != '') {
            await users.updateOne({ _id: id }, { $set: { username: req.body.username } })
            usercredentials = {
                username: req.body.username
            }
            console.log('username updated');
        }
        if (req.body.phoneno != '') {
            await users.updateOne({ _id: id }, { $set: { phoneno: req.body.phoneno } })
            usercredentials = {
                phoneno: req.body.phoneno
            }
            console.log('phoneno updated');
        }
        if (req.body.newpassword != '') {
            console.log('Updated password')
            usercredentials = {
                password: req.body.newpassword
            }
            await users.updateOne({ _id: id }, { $set: { password: req.body.newpassword } }).then(() => {
                res.send({ redirectUrl: '/user' });

            })
    }
    else {
        console.log('Invalid old password')
        }
    }

})



app.listen(8000, (error) => {
    if (!error) {
        console.log('Server is running on port 8000');
    }
    else {
        console.log('Server is not running');
    }
})  