var cli = require("node-cmd");
var output = "";
var cmd = "echo";
var cmdArgs = [" "];
run();
function run() {runCommand(cmd, cmdArgs, runCommandCallback);}

function runCommandCallback(result) {
    console.log(cmd + " arg:" + cmdArgs);
    output += result;
    console.log(output);
}

function runCommand(cmd, args, callback) {
    var spawn = require("child_process").spawn;
    var command = spawn(cmd, args);
    command.stdout.on("data", function(data) {
        output += data.toString();
    });
    command.on("error", function(err){throw err});
    command.on("close", function(code) {
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
    if(args[0].includes("help")) {
        botPayload = help(args);
    }
    if(args[0].includes("nslookup")) {
        nslookup(args);
        botPayload = {"text" : output };
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
        "text" : "Commands: !help, !nslookup <domain>"
    };
}

function nslookup(args) {
    var res = { "text" : "" };
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
    cmdArgs = [domain];
    run();
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
