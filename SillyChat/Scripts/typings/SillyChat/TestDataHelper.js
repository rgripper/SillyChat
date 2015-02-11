define(["require", "exports", "knockout"], function (require, exports, ko) {
    var TestDataHelper = (function () {
        function TestDataHelper() {
        }
        TestDataHelper.getRandomItem = function (array) {
            var min = 0;
            var max = array.length - 1;
            var index = Math.round(Math.random() * (max - min) + min);
            return array[index];
        };
        TestDataHelper.createTestMessages = function (count) {
            var oldMessages = [];
            var msgCount = 0;
            var participants = [{
                id: 4402,
                name: "Joe",
                avatarUrl: "http://www.wikihow.com/images/c/c0/Color-Step-10-3.jpg",
                draftText: ko.observable("")
            }, {
                id: 4403,
                name: "Stewie",
                avatarUrl: "http://jacorre.com/design/images/familyguy-stewie.gif",
                draftText: ko.observable("")
            }];
            function createTestMessage() {
                var newDate = new Date();
                newDate.setMinutes(newDate.getMinutes() - Math.random() * 600);
                return {
                    conversationId: 3001,
                    date: newDate.getTime().toString(),
                    id: msgCount++,
                    author: TestDataHelper.getRandomItem(participants),
                    text: "me-me-me"
                };
            }
            var messages = [];
            for (var i = 0; i < count; i++) {
                messages.push(createTestMessage());
            }
            return messages;
        };
        return TestDataHelper;
    })();
    exports.TestDataHelper = TestDataHelper;
});
//# sourceMappingURL=TestDataHelper.js.map