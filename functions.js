const argon2 = require("argon2");

async function hashPassword(password) {
    try {
        const hash = await argon2.hash(password);
        console.log("The hashed password: ", hash);
    } 
    catch(exception) {
        console.log(exception.message);
    }
}


async function verifyPassword(hash, password) {
    try {
        // decoding the password:
        if (await argon2.verify(hash, password))
        console.log(true);
        else
            console.log(false);
    }
    catch (exception) {
        console.log(exception.message);
    }

}