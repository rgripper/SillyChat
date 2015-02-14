/// <amd-dependecy path="signalRHubs" >
/// <reference path="globalsettings.d.ts" />
/// <reference path="hubinterfaces.d.ts" />

import ko = require("knockout");
import sillyChat = require("ChatViewModel");

function initChatClient(client: IChatClient, chat: sillyChat.ChatViewModel) {

    var expirableObservable = function <T>(initialValue: T, timeout: number): KnockoutObservable<T> {
        var observable = ko.observable<T>(initialValue).extend({ notify: 'always' });
        var timeoutHandle = null;
        observable.subscribe(x => {
            clearTimeout(timeoutHandle);
            if (x !== initialValue) {
                timeoutHandle = setTimeout(() => observable(initialValue), timeout);
            }
        });
        return observable;
    };

    var createParticipantFromUser = (user: IUser) => {
        var participant = <sillyChat.IParticipantViewModel>user;
        participant.draftText = ko.observable("");
        participant.isWriting = expirableObservable(false, 3000);
        return participant;
    };

    client.addMessage = function (message: IMessage) {
        chat.messages.push(message);
        var list = <HTMLUListElement>document.getElementsByClassName("chat-list")[0];
        list.scrollTop = list.scrollHeight;
    };
    client.addParticipant = function (user: IUser) {
        var containsUser = chat.participants().some(x => x.id === user.id);
        if (!containsUser) {
            chat.participants.push(createParticipantFromUser(user));
        }
    };
    client.init = function (owner: IUser, users: IUser[], messages: IMessage[]) {
        chat.tooManyUsers(false);
        chat.owner(createParticipantFromUser(owner));
        chat.messages.removeAll();
        messages.forEach(x => chat.messages.push(x));
        chat.participants.removeAll();
        users.map(createParticipantFromUser).forEach(x => chat.participants.push(x));
    };
    client.removeParticipant = function (userId: number) {
        chat.participants.remove(x => x.id === userId);
    };
    client.setTooManyUsers = function () {
        chat.tooManyUsers(true);
    };
    client.setDraftText = function (userId: number, text: string) {
        var participant = chat.participants().filter(p => p.id === userId)[0];
        if (participant) {
            participant.draftText(text);
            participant.isWriting(true);
        }
    };
}

require([],() => {

    ko.bindingHandlers["pressEnter"] = {
        init: function (element: HTMLElement, valueAccessor) {
            element.addEventListener("keydown", function (e) {
                if (e.which === 13) {
                    valueAccessor();
                    e.preventDefault();
                }
            });
        }
    };

    var chatHubProxy = $.connection.chatHub;

    var chat = new sillyChat.ChatViewModel();

    chat.submitMessage = function () {
        var text = this.owner().draftText();
        if (text.trim()) {
            this.sendingMessage(true);
            chatHubProxy.server.addMessage(text);
            this.sendingMessage(false); // TODO
            this.owner().draftText("");
        }
    };

    chat.owner.subscribe(owner => {
        if (owner) {
            owner.draftText.subscribe(x => chatHubProxy.server.setDraftText(x));
        }
    });

    var app = {
        settings: window.sillyChatSettings,
        connected: ko.observable(false),
        chat: chat,
        controls: {
            isSigningIn: ko.observable(false),
            userName: ko.observable(""),
            signIn: function () {
                var userName = app.controls.userName();
                if (!userName.trim()) {
                    return;
                }
                $.post(app.settings.signInPath, { name: userName })
                    .done((x: { success: boolean }) => {
                    if (x.success) {
                        app.controls.connectAndJoin().always(() => app.controls.isSigningIn(false));
                    }
                    else {
                        app.controls.isSigningIn(false);
                    }
                })
                    .fail(x => app.controls.isSigningIn(false));
            },
            connectAndJoin: () => $.connection.hub.start().done(() => { app.chat.tooManyUsers(false); app.connected(true); chatHubProxy.server.join(); }),
            signOut: function () {
                $.connection.hub.stop();
                $.post(app.settings.signOutPath);
                chat.owner(null);
                app.connected(false);
            }
        }
    };

    app.chat.tooManyUsers.subscribe(tooMany => {
        if (tooMany) {
            app.controls.signOut();
        }
    });

    initChatClient(chatHubProxy.client, chat);

    if (app.settings.isAuthenticated) {
        app.controls.connectAndJoin().done(x => { ko.applyBindings(app); });
    }
    else {
        ko.applyBindings(app);
    }

});