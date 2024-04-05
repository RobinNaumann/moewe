export interface MError{
    code: number;
    message: string;
    data?: any;
}

function _err(code: number, message: string):((e?: any) => MError) {
    return (e) => ({ code, message, data: e ?? undefined});
}

export const err = {
    invalidParameter: _err(400, "invalid parameter"),
    badRequest: _err(400, "bad request"),
    notFound: _err(404, "not found"),
    notAuthorized: _err(401, "not authorized"),
    internalError: _err(500, "internal error"),
    notImplemented: _err(501, "not implemented"),
    notAllowed: _err(405, "not allowed"),
    notAcceptable: _err(406, "not acceptable"),
    conflict: _err(409, "conflict"),
    tooManyRequests: _err(429, "too many requests"),
    serverUnavailable: _err(503, "server unavailable"),
};

export function sendError(res: any, error: any) {
    if('code' in error && 'message' in error && 'data' in error) {
        res.status(error.code).json(error);
        return;
    }
    res.status(500).json({code: 500,message: "an unknown error has occurred", debug: error});
}