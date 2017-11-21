"use strict";

/* SETUP SERVER */

var express = require("express");
var http = require("http");
var request = require("request");

var app = express();
var port = 8000;
var server = http.createServer(app).listen(port, function () {
    console.log("Express server listening on port " + port);
});

/* APP CONSTANT */

// get your own API cred at https://www.instagram.com/developer/clients/
var CLIENT_ID = "1615ccbe5065426d808b8df709bd5b31";
var CLIENT_SECRET = "046ab116991047e988aece23528b49b2";

var REDIRECT_URI = "http://localhost:8000";
var authURL = "https://api.instagram.com/oauth/authorize/?client_id=" + CLIENT_ID + "&redirect_uri=" + REDIRECT_URI + "&response_type=code";
var accessTokenURL = "https://api.instagram.com/oauth/access_token";
var userSelfURL = "https://api.instagram.com/v1/users/self";

/* SIMPLE ROUTE */

app.get("/instagramOAuth", function (req, res) {
    res.redirect(authURL);
    res.end();
});

app.get("/", function (req, res) {

    var code = req.query.code;
    if (code) {

        var formData = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "authorization_code",
            redirect_uri: REDIRECT_URI,
            code: code
        };

        request.post({
            url: accessTokenURL,
            formData: formData
        }, function (error, response, body) {
            if (error) {
                return console.error("Cannot obtain access_token from instagram:", error);
            }

            var selfURL = userSelfURL + ("?access_token=" + JSON.parse(body).access_token);

            request.get({
                url: selfURL
            }, function (error, response, body) {
                res.setHeader('Content-Type', 'application/json');

                var bodyParsed = JSON.parse(body).data;

                console.log(bodyParsed);
                if (!bodyParsed) {
                    res.end();
                    return;
                }

                res.send(JSON.stringify({
                    Name: bodyParsed.full_name,
                    Bio: bodyParsed.bio,
                    Media: bodyParsed.counts.media,
                    Follows: bodyParsed.counts.follows,
                    Followers: bodyParsed.counts.followed_by,
                    DISCLAIMER: "I can do more productive thing if the app gets proper scope as defined in here https://www.instagram.com/developer/authorization/"
                }, null, 4));
                // Can do more productive thing with different scope
            });
        });
    } else {
        res.writeHead(200);
        res.end();
    }
});