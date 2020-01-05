const hey = require('./hey');
hey.send().then(() => {
    console.log("hey!");
    hey.send().then(() => {
        console.log("hey!");
        hey.send().then(() => {
            console.log("finish!");
        }, handleError);
    }, handleError);
}, handleError);

function handleError(err) {
    console.error(err);
}