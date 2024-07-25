
import { UserPayload } from "@/shared/interfaces/auth";
import RefreshToken from "@/shared/models/refresh-token";
import { generateAccessTokenAsync } from "@/shared/utils";


export default class TokenService {

    constructor() { }

    public async issueToken(token: string): Promise<string> {
        //verify token
        const refreshToken = await RefreshToken.findOne({
            where: {
                value: token,
            },
        });

        if (!refreshToken) {
            throw new Error('Invalid token');
        }

        if (refreshToken.expiresAt < new Date()) {
            throw new Error('Token expired');
        }

        const user = refreshToken.user;
        const accessToken = await generateAccessTokenAsync(user as UserPayload);
        return accessToken as string;

    }

}