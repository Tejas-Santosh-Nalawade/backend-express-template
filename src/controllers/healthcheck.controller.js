import { APIResponse } from "../utils/api-response.js";


const healthCheck = (req, res) => {
    try {
        res.status(200).json(new APIResponse(200, {null, "Server is healthy"));
    } catch (error) {
        res.status(500).json(new APIResponse(500, error.message, "Internal Server Error"));
    }
};

export default healthCheck;  