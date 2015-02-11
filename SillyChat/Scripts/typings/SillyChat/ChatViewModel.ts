import ko = require('knockout');
import hubInterfaces = require("HubInterfaces");

export class ChatViewModel {
    
    public participants = ko.observableArray<IParticipantViewModel>([]);

    public otherWritingParticipants = ko.computed<IParticipantViewModel[]>(() =>
        this.participants().filter(p => (!this.owner() || p.id !== this.owner().id) && !!p.draftText().trim()));

    public messages = ko.observableArray<hubInterfaces.IMessage>([]);

    public orderedMessages = ko.computed<hubInterfaces.IMessage[]>(() => { var tmp = this.messages(); tmp.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); return tmp; });

    public owner = ko.observable<IParticipantViewModel>(null);

    public tooManyUsers = ko.observable(false);

    public sendingMessage = ko.observable(false);

    public isYourMessage = (x: hubInterfaces.IMessage) => this.owner() && this.owner().id === x.author.id;

    public submitMessage: () => void;
}

export interface IParticipantViewModel extends hubInterfaces.IUser {
    draftText: KnockoutObservable<string>;
}

export interface IDraftMessageViewModel {
    author: IParticipantViewModel;
    text: KnockoutObservable<string>;
}