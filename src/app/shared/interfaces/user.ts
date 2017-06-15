export interface User {
    level: number,
    gameRole: string,
    platform: string,
    continent: string,
    reasonToJoin: string,
    activated: boolean,
    shipName: string,
    bio: string,
    avatar: string,
    email: string,
    token: string,
    expire: Date,
    createdAt: Date,
    wings: object[]
}

export interface SimpleUser {
    username: string,
    password: string
}