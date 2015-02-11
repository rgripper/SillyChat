/// <amd-dependecy path="signalRHubs" >
import ko = require("knockout");
import sillyChat = require("ChatViewModel");
import testData = require("TestDataHelper");
import hubInterfaces = require("HubInterfaces");

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

    var createParticipantFromUser = (user: hubInterfaces.IUser) => {
        var participant = <sillyChat.IParticipantViewModel>user;
        console.log(user);
        participant.draftText = ko.observable("");
        return participant;
    };

    var chatHubProxy = <hubInterfaces.ChatHubProxy>$.connection["chatHub"];
    chatHubProxy.client.addMessage = function (message: hubInterfaces.IMessage) {
        chatViewModel.messages.push(message);
    };
    chatHubProxy.client.addParticipant = function (user: hubInterfaces.IUser) {
        chatViewModel.participants.push(createParticipantFromUser(user));
    };
    chatHubProxy.client.init = function (owner: hubInterfaces.IUser, users: hubInterfaces.IUser[], messages: hubInterfaces.IMessage[]) {
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
    
    $.connection.hub.reconnected(() => app.connected(true));
    $.connection.hub.disconnected(() => app.connected(false));

    var app = {
        connected: ko.observable(false),
        chat: chatViewModel,
        controls: {
            userName: ko.observable(""),
            signIn: function () {
                $.post("/Home/SignIn", { name: app.controls.userName() }).done((x: { success: boolean }) => {
                    if (x.success) {
                        $.connection.hub.start().done(() => app.connected(true));
                        //chatHubProxy.server.join(app.controls.userName());
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