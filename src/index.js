import {app} from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

const port = process.env.PORT;

dotenv.config({
    path : "./.env"
});

await connectDB()
.then(
    app.listen(port , () =>{
        console.log("App is running at the port: " , port);
    })
).catch((error) => {
    console.log("Something went wrong while starting the server" , error.message);
});

