interface IUser {
    id: number;
    avatarUrl: string;
    name: string;
}

interface IMessage {
    id: number;

    author: IUser;

    text: string;

    date: string;
}

interface IChatClient {
    init(owner: IUser, users: IUser[], messages: IMessage[]): void;

    setTooManyUsers(): void;

    addParticipant(user: IUser): void;

    removeParticipant(userId: number): void;

    addMessage(message: IMessage): void;

    setDraftText(userId: number, text: string): void;
}

interface IChatServer {
    addMessage(text: string): void;
    
    setDraftText(text: string): void;
}

interface ChatHubProxy {
    client: IChatClient;
    server: IChatServer;
}