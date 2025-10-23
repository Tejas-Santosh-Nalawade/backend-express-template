// Used to structure API Responses consistently throughout the application

class ApiResponse {
    constructor(statusCode, data, message="Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode >= 200 && statusCode < 300;
    }
}

export { ApiResponse };