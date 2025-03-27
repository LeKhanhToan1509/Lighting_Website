import mongoose from "mongoose";
import mongoDbConfig from "../configs/mongoDb.config.js";

class MongoDB {
    constructor(mode = "prod") {
        this.connectString = `mongodb://${mongoDbConfig.db.host}:${mongoDbConfig.db.port}/${mongoDbConfig.db.name}`;
        this.mode = mode;
        this.connect();
    }
    connect = () => {
        if(this.mode === "dev"){
            mongoose.set("debug", true);
            mongoose.set("debug", { color: true });
        }
        mongoose.connect(this.connectString)
            .then(() => {
                console.log("Connected to MongoDB ");
            })
            .catch((err) => {
                console.log("Error connecting to MongoDB", err);
            });
    }
    static getMongoInstance(mode) {
        if(!MongoDB.instance){
            MongoDB.instance = new MongoDB(mode);
        }
        return MongoDB.instance;
    }
}
export default MongoDB;