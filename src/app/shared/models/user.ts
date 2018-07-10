export class User {
    username: string;
    level: number;
    gameRole: string;
    platform: string;
    continent: string;
    reasonToJoin: string;
    activated: boolean;
    shipName: string;
    bio: string;
    avatar: string;
    email: string;
    token: string;
    expire: Date;
    createdAt: Date;
    wings: object[];
    discordID?: string;
}

export class SimpleUser {
    username: string;
    password: string;
}

export class NewUser {
    username: string;
    password: string;
    gameRole: string;
    platform: string;
    continent: string;
    reasonToJoin: string;
    shipName: string;
    bio: string;
    email: string;
}