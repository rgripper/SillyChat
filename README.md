## Task 1: Write a simple chat application with the following requirements: 
* The user should enter a name to login to the system. (Important: no password or registration is required).
* There is a button to logout after the user logs in. 
* When the user logs in, the last 15 messages will be shown (if available). 
* The system allows up to 20 users at a time. 
  **(It has only 3 for testing purposes, can be changed in appSettings)**
* The system shows a list of all available users.  
* Each user has a textbox to type the message. Pressing Enter will send it. 
# Extra features: (with bonus points for each) 
* Show “(is typing)” next to the names of users currently typing their messages. 
  **(When another user types his avatar (the one after the "Users in chat" label) has a running line beneath)**
* Users see the text each user is typing as it’s being typed in real-time (should reflects backspaces for example) before the message is finalized by being sent.  If you added any other features, please mention that in the README file
  **(Is shows as a half-opaque message that always stays below the other already submitted messages of that user)**
  
## Task 2
  The array thing in the json cannot be easily parsed by SimpleJson, which RestSharp internally uses, so it currently parses that thing as dynamics to `Entries` and then it is strongly typed as `TypedEntries`.
