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

    var owner = { id: 4401, name: "Sammy", avatarUrl: "http://gallery2.thedms.co.uk/profile-default.jpg", draftText: ko.observable("") };
    var messages = testData.TestDataHelper.createTestMessages(12);

    var chatViewModel = new sillyChat.ChatViewModel(owner, messages);

    chatViewModel.activeParticipants.push(owner, messages[0].author);

    chatViewModel["sillyChat"] = sillyChat;
    ko.applyBindings(chatViewModel);
});