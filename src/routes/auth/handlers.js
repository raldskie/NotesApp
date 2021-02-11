'use strict';

var internals = {};
var User = require('../../database/models/User');
var Crypto = require('../../lib/Crypto')

internals.log_in = (req, reply) => {
    return reply.view('auth/log-in.html', {
        messageTitle: req.query.messageTitle,
        message: req.query.message,
        alertType: req.query.alertType
    });
}

internals.authenticate = (req, reply) => {
    return User.findOne({ username: req.payload.username })
        .then(user => {
            if (req.payload.password != Crypto.decrypt(user.password)) {
                return reply.redirect('/?message=Not found try again. &messageTitle=Failed &alertType=danger');
            }
            req.cookieAuth.set(user);
            return reply.redirect('/home');
        }).catch(() => {
            return reply.redirect('/?message=Fill all fields. &messageTitle=Failed &alertType=danger');
        })
}

internals.sign_up = (req, reply) => {
    return reply.view('auth/sign-up.html', {
        messageTitle: req.query.messageTitle,
        message: req.query.message,
        alertType: req.query.alertType
    });
}

internals.save_user = (req, reply) => {

    if (!validateEmail(req.payload.email))
        return reply.redirect('/sign-up?message=Email not valid. &messageTitle=Failed &alertType=danger');

    const newUser = User({
        username: req.payload.username,
        email: req.payload.email,
        password: Crypto.encrypt(req.payload.password)
    });

    return User.findOne({ username: req.payload.username }).then(user => {
        if (!user) {
            return newUser.save()
                .then(() => {
                    return reply.redirect('/?message=User successfully added. &messageTitle=Success &alertType=success');
                })
                .catch(err => {
                    console.log(err);
                    return reply.redirect('/sign-up?message=Please fill all fields. &messageTitle=Failed &alertType=danger');
                });
        } else {
            return reply.redirect('/sign-up?message=User already exists. &messageTitle=Failed &alertType=danger');
        }
    });

}

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

internals.sign_out = (req, reply) => {
    req.cookieAuth.clear();
    return reply.redirect('/?message=Sign Out Successful. &messageTitle=Success &alertType=success');
}

module.exports = internals;