var cli = require("node-cmd");
var await = require("await");
var safeEval = require("safe-eval");
var output;
//var output = runCommand(cmd, cmdArgs, function(result) { return result; });

/*function runCommandCallback(result) {
    console.log(cmd + " arg:" + cmdArgs);
    console.log(output);
    return result;
}*/

function runCommand(cmd, args, callback) {
    var spawn = require("child_process").spawn;
    var command = spawn(cmd, args);
    console.log("1 " + cmd + " " + args);
    command.stdout.on("data", function(data) {
        output = data.toString();
    });
    command.on("error", function(err){throw err});
    command.on("close", function(code) {
        console.log("2 " + output);
        return callback(output);
    });
}
/*runCommand("nslookup", ["google.com"]);
function runCommand(cmd, args) {
    cli.get(cmd, function(data) {
            output = data;
        }
    );
}*/

module.exports = function (req, res, next) {
    var userName = req.body.user_name;
    var args = req.body.text.split(" ");
    var botPayload;
    console.log(args);
    var cmdName = args[0].substring(1);
    if(cmdName === "help") {
        botPayload = help(args);
    }
    else if(cmdName === "hello") {
        botPayload = { text : "Hello, " + userName + "!" };
    }
    else if(cmdName === "nslookup") {
        botPayload = { text : nslookup(args)};//runCommand(cmdName, [args[1]], function(result) { return result; });//nslookup(args);
        console.log("3 " + nslookup(args));
    }
    else if(cmdName === "calc") {
        botPayload = { text : safeEval(args[1].toString().replace("/([^\d\w+\-*\/\\\(\)\.])/", "")) };
    }
    else if(cmdName === "lmgtfy") {
        var search = "";
        for(var i = 1; i < args.length; i++) {
            search += args[i] + "+";
        }
        botPayload = { text : "http://lmgtfy.com/?q=" + search.substring(0, search.length - 1) };
    }
    else if(cmdName === "g") {
        var search = "";
        for(var i = 1; i < args.length; i++) {
            search += args[i] + "+";
        }
        botPayload = { text : "http://google.com/search?q=" + search.substring(0, search.length - 1) };
    }
    else if(cmdName === "date") {
        var offset = -4;
        botPayload = { text : new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" ) };
    }
    else {
        botPayload = { text : "Invalid command. Run !help to see supported commands." }
    }
    // avoid infinite loop
    if (userName !== 'slackbot') {
        return res.status(200).json(botPayload);
    } else {
        return res.status(200).end();
    }
}

function help(args) {
    return {
        "text" : "Commands: !help, !hello, !nslookup <domain>, !calc <expression>, !lmgtfy <thing>, !g <thing>, !date"
    };
}

function nslookup(args) {
    res = { text : "" };
    if(args.length == 1 || args[1].match("/([^.\d\w])/g")) {
        res["text"] = "Invalid syntax";
        return res;
    }
    var domain = args[1];
    cmd = "nslookup"
    if(args[1].includes("|")) {
        domain = args[1].split("|")[1];
        domain = domain.slice(0, domain.length - 1);
    }
    res = { text : await("data") };
    runCommand(cmd, [domain], function(result) { 
        res = result;
        //res["text"].keep("data", result);
        return result;
    });
    //res["text"] = output;
    return res;
}


function start(token) { 
    request
        .get("https://slack.com/api/rtm.start", {
            'auth': {
                'token':getConfig("token"),
            }
        })
        .on('response', function(response) {
            console.log(response.statusCode);
            console.log(response.headers['content-type']);
        })
        .pipe(fs.createWriteStream('state.json'));
}

var config;
function getConfig(arg) {
    fs.readFile('./config.json', function read(err, data) {
        if(err) {
            throw err;
        }
        if(typeof config != 'object') {
            config = JSON.parse(data);
        }
        console.log(config[arg]);
        return config[arg];
    });
}
