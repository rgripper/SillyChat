﻿/// <reference path="hubinterfaces.d.ts" />
import sillyChat = require("ChatViewModel");

import ko = require("knockout");

export class TestDataHelper {

    private static getRandomItem<T>(array: T[]) {
        var min = 0;
        var max = array.length - 1;
        var index = Math.round(Math.random() * (max - min) + min);
        return array[index];
    }

    public static createTestMessages(count: number): IMessage[] {

        var oldMessages = []
        var msgCount = 0;

        var participants: sillyChat.IParticipantViewModel[] = [{
            id: 4402,
            name: "Joe",
            avatarUrl: "http://www.wikihow.com/images/c/c0/Color-Step-10-3.jpg",
            draftText: ko.observable(""),
            isWriting: ko.observable(false)
        }, {
                id: 4403,
                name: "Stewie",
                avatarUrl: "http://jacorre.com/design/images/familyguy-stewie.gif",
                draftText: ko.observable(""),
                isWriting: ko.observable(false)
            }];

        function createTestMessage(): IMessage {
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
    }
} 