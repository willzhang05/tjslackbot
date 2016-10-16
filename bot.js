var exec = require("child_process").exec;
var safeEval = require("safe-eval");

module.exports = function (req, res, next) {
    var userName = req.body.user_name;
    var args = req.body.text.split(" ");
    var botPayload;
    var cmdName = args[0].substring(1);
    cmdHandler(userName, cmdName, args, function(data) {
        botPayload = data;
        console.log(botPayload);
        if(botPayload["text"] === "") {
            botPayload["text"] = "Oops! An error occured.";
        }
        if (userName !== 'slackbot') {
            return res.status(200).json(botPayload);
        } else {
            return res.status(200).end();
        }
     });
}

function cmdHandler(userName, cmdName, args, callback) {
    var errStr = "Invalid syntax";
    try {
        if(cmdName === "help") {
            callback(help(args));
        }
        else if(cmdName === "hello") {
            callback({ text : "Hello, " + userName + "!" });
        }
        else if(cmdName === "g") {
            if(args.length > 1) {
                var search = "";
                for(var i = 1; i < args.length; i++) {
                    search += args[i] + "+";
                }
                callback({ text : "http://google.com/search?q=" + search.substring(0, search.length - 1) });
            } else {
                throw errStr;
            }
        }
        else if(cmdName === "date") {
            var offset = -4;
            callback({ text : new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" ) });
        }
        else if(cmdName === "ping") {
            ping(args, function(data) { callback(data); });  
        }
        else if(cmdName === "uptime") {
            uptime(args, function(data) { callback(data); });  
        }
        else if(cmdName === "calc") {
            if(args.length > 1) {
                var exp = "";
                for(var i = 1; i < args.length; i++) {
                    exp += args[i].toString().replace("/([^\d\w+\-*\/\\\(\)\.])/", "");
                }
                var res = safeEval(exp);
                if(res === Infinity) {
                    callback({ text : "Infinity" });
                } else {
                    callback({ text : res });
                }
            } else {
                throw errStr;
            }
        } else if(cmdName === "choose") {
            if(args.length == 4) {
                var prob = Math.random();
                if(Math.random() < 0.5) {
                    callback({ text : args[1] });
                } else {
                    callback({ text : args[3] });
                }
            } else {
                throw errStr;
            }
        } else if(cmdName === "pester") {
            if(args.length > 2) {
                var user = "@" + args[1];
                var msg = "";
                for(var i = 2; i < args.length; i++) {
                    msg += " " + args[i];
                }
                msg = user + msg + msg + msg;
                callback({ text : msg });
            } else {
                throw errStr;
            }
        }
        else {
            callback({ text : "Invalid command. Run !help to see supported commands." });
        }
    } catch (e) {
        callback({ text : e.toString() });
    }
}

/*function execute(command, callback) {
    exec(command, function(error, stdout, stderr){ callback(stdout); });
}*/

function help(args) {
    return {
        "text" : "Commands: !help, !hello, !calc <expression>, !g <thing>, !date, !ping <domain>, !uptime, !choose <thing 1> or <thing 2>, !pester <username> <thing>"
    };
}

function ping(args, callback) {
    if(args.length == 1 || args[1].match("/([^.\d\w])/g")) {
        callback({ text : "Invalid syntax" });
    } else {
        var domain = args[1];
        cmd = "ping"
        if(domain.includes("|")) {
            domain = args[1].split("|")[1];
            domain = domain.slice(0, domain.length - 1);
        }
        exec(cmd + " -c 1 " + domain, function(error, stdout, stderr) { 
            if(error) {
                callback({text : stderr});
            } else {
                callback({text : stdout});
            }
        });
    }
}

function uptime(args, callback) {
    cmd = "uptime"
    exec(cmd, function(error, stdout, stderr) { 
        if(error) {
            callback({text : stderr});
        } else {
            callback({text : stdout});
        }
    });
}
