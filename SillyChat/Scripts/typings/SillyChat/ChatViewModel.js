define(["require", "exports", 'knockout'], function (require, exports, ko) {
    var ChatViewModel = (function () {
        function ChatViewModel() {
            var _this = this;
            this.participants = ko.observableArray([]);
            this.otherWritingParticipants = ko.computed(function () { return _this.participants().filter(function (p) { return (!_this.owner() || p.id !== _this.owner().id) && !!p.draftText().trim(); }); });
            this.messages = ko.observableArray([]);
            this.orderedMessages = ko.computed(function () {
                var tmp = _this.messages();
                tmp.sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); });
                return tmp;
            });
            this.owner = ko.observable(null);
            this.tooManyUsers = ko.observable(false);
            this.sendingMessage = ko.observable(false);
            this.isYourMessage = function (x) { return _this.owner() && _this.owner().id === x.author.id; };
            this.hasParticipant = function (x) { return _this.participants().some(function (p) { return p.id === x.id; }); };
        }
        return ChatViewModel;
    })();
    exports.ChatViewModel = ChatViewModel;
});
//# sourceMappingURL=ChatViewModel.js.map