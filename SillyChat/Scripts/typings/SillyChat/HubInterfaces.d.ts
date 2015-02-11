export interface IUser {
    id: number;
    avatarUrl: string;
    name: string;
}

export interface IMessage {
    id: number;

    author: IUser;

    text: string;

    date: string;
}

export interface IChatClient {
    init(owner: IUser, users: IUser[], messages: IMessage[]): void;

    setTooManyUsers(): void;

    addParticipant(user: IUser): void;

    removeParticipant(userId: number): void;

    addMessage(message: IMessage): void;
}

export interface IChatServer {
    addMessage(text: string): void;
}

export interface ChatHubProxy {
    client: IChatClient;
    server: IChatServer;
}