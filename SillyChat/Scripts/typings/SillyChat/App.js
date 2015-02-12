/// <amd-dependecy path="signalRHubs" >
/// <reference path="globalsettings.d.ts" />
/// <reference path="hubinterfaces.d.ts" />
define(["require", "exports", "knockout", "ChatViewModel"], function (require, exports, ko, sillyChat) {
    require([], function () {
        ko.bindingHandlers["pressEnter"] = {
            init: function (element, valueAccessor) {
                element.addEventListener("keydown", function (e) {
                    if (e.which === 13) {
                        valueAccessor();
                        e.preventDefault();
                    }
                });
            }
        };
        var chatViewModel = new sillyChat.ChatViewModel();
        chatViewModel.submitMessage = function () {
            var text = chatViewModel.owner().draftText();
            if (text.trim()) {
                chatViewModel.sendingMessage(true);
                chatHubProxy.server.addMessage(text);
                chatViewModel.sendingMessage(false); // TODO
                chatViewModel.owner().draftText("");
            }
        };
        var createParticipantFromUser = function (user) {
            var participant = user;
            participant.draftText = ko.observable("");
            return participant;
        };
        var chatHubProxy = $.connection["chatHub"];
        chatHubProxy.client.addMessage = function (message) {
            chatViewModel.messages.push(message);
        };
        chatHubProxy.client.addParticipant = function (user) {
            var containsUser = chatViewModel.participants().some(function (x) { return x.id === user.id; });
            if (!containsUser) {
                chatViewModel.participants.push(createParticipantFromUser(user));
            }
        };
        chatHubProxy.client.init = function (owner, users, messages) {
            chatViewModel.tooManyUsers(false);
            chatViewModel.owner(createParticipantFromUser(owner));
            chatViewModel.messages.removeAll();
            messages.forEach(function (x) { return chatViewModel.messages.push(x); });
            chatViewModel.participants.removeAll();
            users.map(createParticipantFromUser).forEach(function (x) { return chatViewModel.participants.push(x); });
        };
        chatHubProxy.client.removeParticipant = function (userId) {
            chatViewModel.participants.remove(function (x) { return x.id === userId; });
        };
        chatHubProxy.client.setTooManyUsers = function () {
            chatViewModel.owner(null);
        };
        chatHubProxy.client.setDraftText = function (userId, text) {
            var participant = chatViewModel.participants().filter(function (p) { return p.id === userId; })[0];
            if (participant) {
                participant.draftText(text);
            }
        };
        chatViewModel.owner.subscribe(function (owner) {
            if (owner) {
                owner.draftText.subscribe(function (x) { return chatHubProxy.server.setDraftText(x); });
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
                    $.post(app.settings.signInPath, { name: app.controls.userName() }).done(function (x) {
                        if (x.success) {
                            app.controls.connect().always(function () { return app.controls.isSigningIn(false); });
                        }
                        else {
                            app.controls.isSigningIn(false);
                        }
                    }).fail(function (x) { return app.controls.isSigningIn(false); });
                },
                connect: function () { return $.connection.hub.start().done(function () { return app.connected(true); }); },
                signOut: function () {
                    $.connection.hub.stop();
                    $.post(app.settings.signOutPath);
                    chatViewModel.owner(null);
                }
            }
        };
        $.connection.hub.reconnected(function () { return app.connected(true); });
        $.connection.hub.disconnected(function () { return app.connected(false); });
        if (app.settings.isAuthenticated) {
            app.controls.connect();
        }
        ko.applyBindings(app);
    });
});
//# sourceMappingURL=App.js.map