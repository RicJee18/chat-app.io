$(document).ready(() => {
    $(".main").hide();
    $(function() {

        $("#btnStart").attr("disabled", true);
        var socket = io();
        var usernamei = "";

        $("#username").keyup(function() {
            if ($("#username").val()) {
                $("#btnStart").attr("disabled", false);

            } else {
                $("#btnStart").attr("disabled", true);
            }
        })

        $("#btnStart").click(function() {
            usernamei = $("#username").val();
            $("#LoginDiv").hide();
            $(".main").show();
            socket.emit('online', { username: usernamei });
            $("#ownlabel").text(" " + usernamei)
            socket.emit('broadcast', usernamei)
        });



        $("#message-input").keydown(function() {
            socket.emit("typing", { username: usernamei, })
        })

        $("#message-input").keyup(function() {
            if ($(this).val() == "") {
                socket.emit('stop-typing', { username: usernamei, })
            }
        })

        $("#message-input").keyup(function(e) {
            if (e.keyCode === 13) {
                // Trigger the button element with a click
                $(".send-btn").click();
            }
        })

        $(document).on('click', '.send-btn', () => {
            let message = $("#message-input").val();
            socket.emit('chat message', { username: usernamei, msg: message });
            socket.emit('stop-typing', { username: usernamei })
            if (usernamei.length > 4) {
                nickname = usernamei.slice(0, 4);
            }
            $('#messages').append(
                $('<p>', { class: "rightSmg " }).text(message));
            $(".message-container").scrollTop($(".message-container")[0].scrollHeight);
            $('#message-input').val('');
        })

        socket.on('chat message', function(data) {
            let sender = data.username;
            let sms = data.msg;
            var nickname = sender;
            if (sender.length > 6) {
                nickname = sender.slice(0, 6);
            }
            if (sender != usernamei) {
                $('#messages').append(
                    $('<p>', { class: "leftSmg" }).append(`<span><b>${nickname}</b> </span>: ${sms}`));

                    console.log($(".leftSmg")[$(".leftSmg").length - 1].offsetHeight );
                    console.log($("#messages"));
                    $("#messages").scrollTop($("#chatbox")[0].scrollHeight);
            }
        });

        var current = [];
        socket.on('online', function(msg) {
            $("#onlineUser").text("Active: " + msg.length)
            for (let i = 0; i < msg.length; ++i) {
                if (!current.includes(msg[i].username) && msg[i].username != usernamei) {
                    $("#users").append(
                        '<span class="dot"></i></span>',
                        $("<span>").text("  " + msg[i].username), $("<br>"));
                    current.push(msg[i].username);
                }
            }
        });



        var now_typing = []
        socket.on("typing", function(data) {
            if (data.username != usernamei && !now_typing.includes(data.username)) {
                now_typing.push(data.username);
                $("#divTyping").append($("<span>").text(`${data.username} is typing!`))
            }
        });

        socket.on("stop-typing", function(data) {
            $('#divTyping').empty();
            for (var i = 0; i < now_typing.length; i++) {
                if (now_typing[i] === data.username) {
                    now_typing.splice(i, 1);
                }
            }
            for (var i = 0; i < now_typing.length; i++) {
                $("#divTyping").append($("<span>").text("..."))
            }
            if (now_typing.length == 0) {
                $("#divTyping").text("");
            }
        });

        socket.on('broadcast', function(data) {
            if (data != $("#username").val()) {
                $(document).append($("<p>", { class: 'top_right' }).text(data + " left the chat"))
            }
        })

        socket.on('logout' , function(data){
            $('#messages').append(
                $('<p>', { class: "leftSmg" }).append(`<span><em>${data[0].username} left the group.</em></span>`));

        })

    });
})