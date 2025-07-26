class HttpError extends Error {
    constructor(message, errorCode) {
        super(message);
        Object.setPrototypeOf(this, HttpError.prototype);
        this.name = this.constructor.name;
        this.code = errorCode;
    }
}

export default HttpError;
