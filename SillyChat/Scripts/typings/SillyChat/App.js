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
            console.log(user);
            participant.draftText = ko.observable("");
            return participant;
        };
        var chatHubProxy = $.connection["chatHub"];
        chatHubProxy.client.addMessage = function (message) {
            chatViewModel.messages.push(message);
        };
        chatHubProxy.client.addParticipant = function (user) {
            chatViewModel.participants.push(createParticipantFromUser(user));
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
        $.connection.hub.reconnected(function () { return app.connected(true); });
        $.connection.hub.disconnected(function () { return app.connected(false); });
        var app = {
            connected: ko.observable(false),
            chat: chatViewModel,
            controls: {
                userName: ko.observable(""),
                signIn: function () {
                    $.post("/Home/SignIn", { name: app.controls.userName() }).done(function (x) {
                        if (x.success) {
                            $.connection.hub.start().done(function () { return app.connected(true); });
                        }
                    });
                },
                signOut: function () {
                    $.connection.hub.stop();
                    $.post("/Home/SignOut");
                    chatViewModel.owner(null);
                }
            }
        };
        //$.connection.hub.start().done(function () {
        //    // Wire up Send button to call NewContosoChatMessage on the server.
        //    $('#newContosoChatMessage').click(function () {
        //        contosoChatHubProxy.server.newContosoChatMessage($('#displayname').val(), $('#message').val());
        //        $('#message').val('').focus();
        //    });
        //});
        ko.applyBindings(app);
    });
});
//# sourceMappingURL=App.js.map