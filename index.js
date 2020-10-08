'use strict';
const request = require("request");
const htmparse = require("node-html-parser");
const htmlents = new require('html-entities').XmlEntities;
const chars_alph = "`~@#$%^&*()-_=+\",.'№;:"


function searchHent(text, page, callback) {
    var url;
    if(isNaN(parseInt(text))){
        url = 'https://nhentai.net/search/?q=' + text + '&sort=popular&page='+page;
    }else{
        url = 'https://nhentai.net/search/?q=a+' + text + '&sort=popular&page='+page
    }
    request(
        {
            uri: url,
        }, function (err, res, body) {
        if (err) {
            throw err;
        }
        callback(body.toString());
    });
}


function getHent(code, callback) {
    if(code === "999999"){
        callback(chars_alph);
        return;
    }else{
        request(
            {
                uri: 'https://nhentai.net/g/' + parseInt(code) + '/',
            }, function (err, res, body) {
                    if (err) {
                        throw err;
                    }
                    var regex = /<h1 class="title"><span class="before">(.*)<\/span><span class="pretty">(.*)<\/span><span class="after">(.*)<\/span><\/h1>/;
                    var matches = regex.exec(body.toString());
                    var name = matches[1] + matches[2] + matches[3];
                    callback(htmlents.decode(name));
        });
    }
}

function parseHents(text, callback) {
    var arrayregex = /<div class="container index-container">(.*)<\/div>/;
    var hentregex = /<div class="gallery".*<a href="\/g\/(.*)\/" class="cover".*<div class="caption">(.*)<\/div><\/a><\/div>/;
    var rawhents = arrayregex.exec(text);
    if (rawhents) {
        rawhents = rawhents[1];
    }
    var htmhents = htmparse.parse(rawhents).childNodes;
    var hents = [];
    htmhents.pop();
    if (htmhents.length === 0) {
        callback(hents);
    }
    htmhents.forEach((val, i, arr) => {
        var matches = /href="\/g\/(.*)\/".*/.exec(val.childNodes[0].rawAttrs);

        if (matches) {
            hents.push({
                code: matches[1],
                name: htmlents.decode(val.childNodes[0].lastChild.lastChild.rawText)
            });
        }


        if (i === htmhents.length-1) {
            callback(hents);
        }
    });
}

function findWord(word, callback) {
    searchHent(word, 1, (data) => {
        parseHents(data, (hents) => {
            if(chars_alph.indexOf(word) !== -1 && word !== ""){
                callback({code: "999999", name: chars_alph}, word, chars_alph.indexOf(word));
                return
            }
            if (hents.length === 0) {
                findWord(word.substring(0, word.length - 1), callback);
            } else {
                var wordEx = false;
                for (var i = 0; i < hents.length; i++) {
                    console.log(hents[i]);
                    if (hents[i].name.toLowerCase().indexOf(word.toLowerCase()) !== -1) {
                        callback(hents[i], word, hents[i].name.toLowerCase().indexOf(word.toLowerCase()));
                        wordEx = true;
                        break;
                    }
                }
                if (!wordEx) {
                    findWord(word.substring(0, word.length - 1), callback);
                }
            }
        });
    });
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function crypt(text, callback) {
    var crypted = "";
    function recC(text, callback) {
        if (text === "") {
            callback(crypted);
        } else {
            findWord(text, (hnt, word, index) => {
                if (!hnt) {
                    recC(text, callback);
                } else {
                    crypted += pad(hnt.code, 6);
                    crypted += pad(index, 3);
                    crypted += pad(word.length, 3);
                    text = text.substring(word.length);

                    if (text !== "") {
                        recC(text, callback);
                    } else {
                        callback(crypted);
                    }
                }
            });
        }
    }    
    recC(text, callback);
}

function decrypt(text, callback) {
    var decrypted = "";
    var segments = text.match(/.{1,6}/g);
    var fdec = function (i, callback) {
        getHent(segments[i], (name) => {
            var mseg = segments[i + 1].match(/.{1,3}/g);
            decrypted += name.substring(parseInt(mseg[0]), parseInt(mseg[0]) + parseInt(mseg[1]));
            segments = segments.slice(2);
            if (segments.length !== 0) {
                fdec(0, callback);
            } else {
                callback(decrypted.toLowerCase());
            }
        });
    }
    fdec(0, callback);
}

module.exports = { Crypt: crypt, Decrypt: decrypt };