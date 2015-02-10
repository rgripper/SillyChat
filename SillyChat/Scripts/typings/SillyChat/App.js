define(["require", "exports", "knockout", "ChatViewModel", "TestDataHelper"], function (require, exports, ko, sillyChat, testData) {
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
        var owner = { id: 4401, name: "Sammy", avatarUrl: "http://gallery2.thedms.co.uk/profile-default.jpg", draftText: ko.observable("") };
        var messages = testData.TestDataHelper.createTestMessages(12);
        var chatViewModel = new sillyChat.ChatViewModel(owner, messages);
        chatViewModel.activeParticipants.push(owner, messages[0].author);
        chatViewModel["sillyChat"] = sillyChat;
        ko.applyBindings(chatViewModel);
    });
});
//# sourceMappingURL=App.js.map