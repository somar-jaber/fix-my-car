const argon2 = require("argon2");


(async () => {
    try {
        const hash = await argon2.hash("somarjaber");
        console.log(hash);
    } catch (err) {
        console.log(err);
    }
})()
