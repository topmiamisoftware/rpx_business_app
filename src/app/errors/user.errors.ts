export class EmailConfirmationError extends Error {
    constructor(message) {
        super(message); // (1)
        this.name = 'EmailConfirmationError'; // (2)
    }
}
