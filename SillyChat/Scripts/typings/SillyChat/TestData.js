define(["require", "exports", "typings/SillyChat/ChatViewModel"], function (require, exports, sillyChat) {
    function createTestMessages(count) {
        function getRandomItem(array) {
            var min = 0;
            var max = array.length - 1;
            var index = Math.floor(Math.random() * (max - min) + min);
            return array[index];
        }
        var oldMessages = [];
        var msgCount = 0;
        var participants = [{
            id: 4402,
            ownerName: "Joe",
            avatarUrl: "http://www.wikihow.com/images/c/c0/Color-Step-10-3.jpg"
        }, {
            id: 4403,
            ownerName: "Stewie",
            avatarUrl: "http://jacorre.com/design/images/familyguy-stewie.gif"
        }];
        function createTestMessage() {
            var newDate = new Date();
            newDate.setMinutes(newDate.getMinutes() - Math.random() * 600);
            return {
                conversationId: 3001,
                date: newDate,
                id: msgCount++,
                type: sillyChat.MessageType.text,
                owner: getRandomItem(participants),
                text: "me-me-me"
            };
        }
        return new Array(count).map(function () { return createTestMessage(); });
    }
    exports.createTestMessages = createTestMessages;
});
//# sourceMappingURL=TestData.js.map