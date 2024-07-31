export class ProfileAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProfileAlreadyExistsError';
    }
}