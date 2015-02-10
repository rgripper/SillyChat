import ko = require('knockout');

export class ChatViewModel {
    public activeParticipants = ko.observableArray<IParticipantViewModel>([]);

    public draftMessages = ko.computed<IMessageViewModel[]>(() => this.activeParticipants()
        .filter(p => p.id !== this.owner.id && !!p.draftText().trim())
        .map(p => <IMessageViewModel>{ author: p, text: p.draftText, type: MessageType.text }));

    public messages = ko.observableArray<IMessageViewModel>([]);

    public conversationId = ko.observable<number>();

    constructor(public owner: IParticipantViewModel, oldMessages: IMessageViewModel[] = []) {
        oldMessages.forEach(x => this.messages.push(x));
    }

    public submitMessage(): void {
        if (!this.owner.draftText().trim()) {
            return;
        }
        var newMessage = this.getCurrentMessage();
        this.owner.draftText("");

        this.messages.push(newMessage);
        var list = <HTMLUListElement>document.getElementsByClassName("chat-list")[0];
        list.scrollTop = list.scrollHeight;
    }

    private getCurrentMessage(): IMessageViewModel {
        return {
            author: this.owner,
            text: ko.observable(this.owner.draftText()),
            type: MessageType.text
        };
    }
}

export interface IParticipantViewModel {
    id: number;
    avatarUrl: string;
    name: string;

    draftText: KnockoutObservable<string>;
}

export interface ConversationViewModel {
    id: number;
    participantsIds: number[];
}

export enum MessageType {
    text, image
}

export interface IMessageViewModel {
    id?: number;
    date?: Date;
    author: IParticipantViewModel;
    type: MessageType;

    text?: KnockoutObservable<string>;
    imageUrl?: string;
}