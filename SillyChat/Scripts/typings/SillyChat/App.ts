/// <amd-dependecy path="signalRHubs" >
/// <reference path="globalsettings.d.ts" />
/// <reference path="hubinterfaces.d.ts" />

import ko = require("knockout");
import sillyChat = require("ChatViewModel");
import testData = require("TestDataHelper");

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

    var chatViewModel = new sillyChat.ChatViewModel();

    chatViewModel.submitMessage = () => {
        var text = chatViewModel.owner().draftText();
        if (text.trim()) {
            chatViewModel.sendingMessage(true);
            chatHubProxy.server.addMessage(text);
            chatViewModel.sendingMessage(false); // TODO
            chatViewModel.owner().draftText("");
        }
    };

    var createParticipantFromUser = (user: IUser) => {
        var participant = <sillyChat.IParticipantViewModel>user;
        participant.draftText = ko.observable("");
        return participant;
    };

    var chatHubProxy = <ChatHubProxy>$.connection["chatHub"];
    chatHubProxy.client.addMessage = function (message: IMessage) {
        chatViewModel.messages.push(message);
    };
    chatHubProxy.client.addParticipant = function (user: IUser) {
        var containsUser = chatViewModel.participants().some(x => x.id === user.id);
        if (!containsUser) {
            chatViewModel.participants.push(createParticipantFromUser(user));
        }
    };
    chatHubProxy.client.init = function (owner: IUser, users: IUser[], messages: IMessage[]) {
        chatViewModel.tooManyUsers(false);
        chatViewModel.owner(createParticipantFromUser(owner));
        chatViewModel.messages.removeAll();
        messages.forEach(x => chatViewModel.messages.push(x));
        chatViewModel.participants.removeAll();
        users.map(createParticipantFromUser).forEach(x => chatViewModel.participants.push(x));
    };
    chatHubProxy.client.removeParticipant = function (userId: number) {
        chatViewModel.participants.remove(x => x.id === userId);
    };
    chatHubProxy.client.setTooManyUsers = function () {
        chatViewModel.owner(null);
    };
    chatHubProxy.client.setDraftText = function (userId: number, text: string) {
        var participant = chatViewModel.participants().filter(p => p.id === userId)[0];
        if (participant) {
            participant.draftText(text);
        }
    };

    chatViewModel.owner.subscribe(owner => {
        if (owner) {
            owner.draftText.subscribe(x => chatHubProxy.server.setDraftText(x));
        }
    });

    var app = {
        settings: window.sillyChatSettings,
        connected: ko.observable(false),
        chat: chatViewModel,
        controls: {
            isSigningIn: ko.observable(false),
            userName: ko.observable(""),
            signIn: function () {
                $.post(app.settings.signInPath, { name: app.controls.userName() })
                    .done((x: { success: boolean }) => {
                    if (x.success) {
                        app.controls.connect().always(() => app.controls.isSigningIn(false));
                    }
                    else {
                        app.controls.isSigningIn(false);
                    }
                })
                    .fail(x => app.controls.isSigningIn(false));
            },
            connect: () => $.connection.hub.start().done(() => app.connected(true)),
            signOut: function () {
                $.connection.hub.stop();
                $.post(app.settings.signOutPath);
                chatViewModel.owner(null);
            }
        }
    };

    $.connection.hub.reconnected(() => app.connected(true));
    $.connection.hub.disconnected(() => app.connected(false));

    if (app.settings.isAuthenticated) {
        app.controls.connect();
    }

    ko.applyBindings(app);

});