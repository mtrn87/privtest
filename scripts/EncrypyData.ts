import * as dotenv from "dotenv";
//import { encryptData } from "./Functions";

dotenv.config();
const crypto = require('crypto')

//TODO add validations, type should be a ENUM?

async function main() {
    const parameters = process.argv.slice(2);

    if (!parameters || parameters.length < 2)
        throw new Error("Parameter not provided");

    const data = JSON.parse(parameters[0]);
    const key = parameters[1];

   // const encrypted = encryptData(JSON.stringify(data) , key);       

    //console.log("Encrypted : " + encrypted);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
