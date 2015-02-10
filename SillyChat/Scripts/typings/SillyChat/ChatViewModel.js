define(["require", "exports", 'knockout'], function (require, exports, ko) {
    var ChatViewModel = (function () {
        function ChatViewModel(owner, oldMessages) {
            var _this = this;
            if (oldMessages === void 0) { oldMessages = []; }
            this.owner = owner;
            this.activeParticipants = ko.observableArray([]);
            this.draftMessages = ko.computed(function () { return _this.activeParticipants().filter(function (p) { return p.id !== _this.owner.id && !!p.draftText().trim(); }).map(function (p) { return { author: p, text: p.draftText, type: 0 /* text */ }; }); });
            this.messages = ko.observableArray([]);
            this.conversationId = ko.observable();
            oldMessages.forEach(function (x) { return _this.messages.push(x); });
        }
        ChatViewModel.prototype.submitMessage = function () {
            if (!this.owner.draftText().trim()) {
                return;
            }
            var newMessage = this.getCurrentMessage();
            this.owner.draftText("");
            this.messages.push(newMessage);
            var list = document.getElementsByClassName("chat-list")[0];
            list.scrollTop = list.scrollHeight;
        };
        ChatViewModel.prototype.getCurrentMessage = function () {
            return {
                author: this.owner,
                text: ko.observable(this.owner.draftText()),
                type: 0 /* text */
            };
        };
        return ChatViewModel;
    })();
    exports.ChatViewModel = ChatViewModel;
    (function (MessageType) {
        MessageType[MessageType["text"] = 0] = "text";
        MessageType[MessageType["image"] = 1] = "image";
    })(exports.MessageType || (exports.MessageType = {}));
    var MessageType = exports.MessageType;
});
//# sourceMappingURL=ChatViewModel.js.map