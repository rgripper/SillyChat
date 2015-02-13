/// <amd-dependecy path="signalRHubs" >
/// <reference path="globalsettings.d.ts" />
/// <reference path="hubinterfaces.d.ts" />
define(["require", "exports", "knockout", "ChatViewModel"], function (require, exports, ko, sillyChat) {
    function initChatClient(client, chat) {
        var expirableObservable = function (initialValue, timeout) {
            var observable = ko.observable(initialValue).extend({ notify: 'always' });
            var timeoutHandle = null;
            observable.subscribe(function (x) {
                clearTimeout(timeoutHandle);
                if (x !== initialValue) {
                    timeoutHandle = setTimeout(function () { return observable(initialValue); }, timeout);
                }
            });
            return observable;
        };
        var createParticipantFromUser = function (user) {
            var participant = user;
            participant.draftText = ko.observable("");
            participant.isWriting = expirableObservable(false, 3000);
            return participant;
        };
        client.addMessage = function (message) {
            chat.messages.push(message);
            var list = document.getElementsByClassName("chat-list")[0];
            list.scrollTop = list.scrollHeight;
        };
        client.addParticipant = function (user) {
            var containsUser = chat.participants().some(function (x) { return x.id === user.id; });
            if (!containsUser) {
                chat.participants.push(createParticipantFromUser(user));
            }
        };
        client.init = function (owner, users, messages) {
            chat.tooManyUsers(false);
            chat.owner(createParticipantFromUser(owner));
            chat.messages.removeAll();
            messages.forEach(function (x) { return chat.messages.push(x); });
            chat.participants.removeAll();
            users.map(createParticipantFromUser).forEach(function (x) { return chat.participants.push(x); });
        };
        client.removeParticipant = function (userId) {
            chat.participants.remove(function (x) { return x.id === userId; });
        };
        client.setTooManyUsers = function () {
            chat.tooManyUsers(true);
        };
        client.setDraftText = function (userId, text) {
            var participant = chat.participants().filter(function (p) { return p.id === userId; })[0];
            if (participant) {
                participant.draftText(text);
                participant.isWriting(true);
            }
        };
    }
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
        chat.owner.subscribe(function (owner) {
            if (owner) {
                owner.draftText.subscribe(function (x) { return chatHubProxy.server.setDraftText(x); });
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
                    $.post(app.settings.signInPath, { name: app.controls.userName() }).done(function (x) {
                        if (x.success) {
                            app.controls.connectAndJoin().always(function () { return app.controls.isSigningIn(false); });
                        }
                        else {
                            app.controls.isSigningIn(false);
                        }
                    }).fail(function (x) { return app.controls.isSigningIn(false); });
                },
                connectAndJoin: function () { return $.connection.hub.start().done(function () {
                    app.chat.tooManyUsers(false);
                    app.connected(true);
                    chatHubProxy.server.join();
                }); },
                signOut: function () {
                    $.connection.hub.stop();
                    $.post(app.settings.signOutPath);
                    chat.owner(null);
                    app.connected(false);
                }
            }
        };
        app.chat.tooManyUsers.subscribe(function (tooMany) {
            if (tooMany) {
                app.controls.signOut();
            }
        });
        initChatClient(chatHubProxy.client, chat);
        if (app.settings.isAuthenticated) {
            app.controls.connectAndJoin().done(function (x) {
                ko.applyBindings(app);
            });
        }
        else {
            ko.applyBindings(app);
        }
    });
});
//# sourceMappingURL=App.js.map