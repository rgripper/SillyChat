/// <reference path="hubinterfaces.d.ts" />
import ko = require('knockout');

export class ChatViewModel {
    
    public participants = ko.observableArray<IParticipantViewModel>([]);

    public otherWritingParticipants = ko.computed<IParticipantViewModel[]>(() =>
        this.participants().filter(p => (!this.owner() || p.id !== this.owner().id) && !!p.draftText().trim()));

    public messages = ko.observableArray<IMessage>([]);

    public orderedMessages = ko.computed<IMessage[]>(() => { var tmp = this.messages(); tmp.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); return tmp; });

    public owner = ko.observable<IParticipantViewModel>(null);

    public tooManyUsers = ko.observable(false);

    public sendingMessage = ko.observable(false);

    public isYourMessage = (x: IMessage) => this.owner() && this.owner().id === x.author.id;

    public hasParticipant = (x: IUser) => this.participants().some(p => p.id === x.id);

    public submitMessage: () => void;
}

export interface IParticipantViewModel extends IUser {
    draftText: KnockoutObservable<string>;

    isWriting: KnockoutObservable<boolean>;
}

export interface IDraftMessageViewModel {
    author: IParticipantViewModel;
    text: KnockoutObservable<string>;
}