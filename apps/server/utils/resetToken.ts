import jwt from "jsonwebtoken";

const RESET_SECRET = process.env.RESET_TOKEN_SECRET!;

interface ResetTokenEntry {
    used: boolean;
    expiresAt: number;
}

const RESET_TOKEN_MAP: Record<string, ResetTokenEntry> = {};

export function generateResetToken(email: string) {
    const token = jwt.sign(
        { email, purpose: "PASSWORD_RESET" },
        RESET_SECRET,
        { expiresIn: "10m" }
    );

    RESET_TOKEN_MAP[token] = {
        used: false,
        expiresAt: Date.now() + 10 * 60 * 1000,
    };

    return token;
}

export function verifyResetToken(token: string) {
    const payload = jwt.verify(token, RESET_SECRET) as {
        email: string;
        purpose: string;
    };

    const entry = RESET_TOKEN_MAP[token];

    if (!entry) {
        throw new Error("Reset token not found or already invalidated");
    }

    if (entry.used) {
        throw new Error("Reset token already used");
    }

    if (entry.expiresAt < Date.now()) {
        delete RESET_TOKEN_MAP[token];
        throw new Error("Reset token expired");
    }

    return payload;
}

export function invalidateResetToken(token: string) {
    if (RESET_TOKEN_MAP[token]) {
        delete RESET_TOKEN_MAP[token];
    }
}
