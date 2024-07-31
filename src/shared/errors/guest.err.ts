export class GuestNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GuestNotFoundError';
    }
}

export class GuestAlreadyApprovedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GuestAlreadyApproved';
    }
}

export class GuestAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GuestAlreadyExistsError';
    }
}