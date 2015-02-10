﻿import sillyChat = require("ChatViewModel");
import ko = require("knockout");

export class TestDataHelper {

    private static getRandomItem<T>(array: T[]) {
        var min = 0;
        var max = array.length - 1;
        var index = Math.round(Math.random() * (max - min) + min);
        return array[index];
    }

    public static createTestMessages(count: number): sillyChat.IMessageViewModel[] {

        var oldMessages = []
        var msgCount = 0;

        var participants: sillyChat.IParticipantViewModel[] = [{
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

        function createTestMessage(): sillyChat.IMessageViewModel {
            var newDate = new Date();
            newDate.setMinutes(newDate.getMinutes() - Math.random() * 600);

            return {
                conversationId: 3001,
                date: newDate,
                id: msgCount++,
                type: sillyChat.MessageType.text,
                author: TestDataHelper.getRandomItem(participants),
                text: ko.observable("me-me-me")
            };
        }

        var messages = [];
        for (var i = 0; i < count; i++) {
            messages.push(createTestMessage());
        }
        return messages;
    }
} 