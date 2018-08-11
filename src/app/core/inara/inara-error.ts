import { InaraErrorCode } from "./inara-error-code";

export class InaraError extends Error {
    constructor(message: string, public code: InaraErrorCode) {
        super()
        this.message = message;
    }
}