import { admins } from "./constants/admin-data.js";
import Admin from "./model/admin-schema.js";

const DefaultAdmin = async () => {
    try {
        await Admin.insertMany(admins);
        console.log("Data inserted successfully");
    } catch (error) {
        console.log("Error while inserting the admin data.", error);
    }
}

export default DefaultAdmin;