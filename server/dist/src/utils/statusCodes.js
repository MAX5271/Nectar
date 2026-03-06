var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["SUCCESS"] = 200] = "SUCCESS";
    StatusCode[StatusCode["CREATED"] = 201] = "CREATED";
    StatusCode[StatusCode["NO_CONTENT"] = 204] = "NO_CONTENT";
    StatusCode[StatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCode[StatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    StatusCode[StatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    StatusCode[StatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    StatusCode[StatusCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    StatusCode[StatusCode["CONFLICT"] = 409] = "CONFLICT";
})(StatusCode || (StatusCode = {}));
export default StatusCode;
//# sourceMappingURL=statusCodes.js.map