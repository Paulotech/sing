
var VideoPlayerIsCompleted = false;
var IDRequisito;

function hex2a(hexx) {
    var hex = hexx.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function OpenVideo(id, videos, nome, descricao, idrequisito) {

    for (var i = 0; i < videos.length; i++) {
        videos[i].file = hex2a(videos[i].file);
    }

    IDRequisito = undefined;

    $('#videoDescricao').html(descricao);

    if (descricao) $('#videoDescricao').show();

    PlayerExec({
        nome: nome,
        videos: videos,
        onComplete: function () {
            $.ajax({
                url: urlWebApi + "videotecadigital/GravarLogAcessoVideo",
                data: { 'id': id },
                dataType: 'json'
            });
            VideoPlayerIsCompleted = true;
            IDRequisito = idrequisito;
        }
    });
}

function PlayerExec(options) {

    jwplayer('videoPlayer').stop();

    SetPlayerResources();

    if (!options.debug) {
        $("#video-player-shadow").show();
        $("#video-player-shadow").css("height", $(document).height() + 100);
        $('#video-content').show();
        $('#videoNome').html(options.nome);
        $("#videoFechar").show();
        if (options.nome) $('#videoNome').show();
    }

    window.onerror = function (error) {
        SetInfoMessenge({ message: error })
    };

    jwplayer('videoPlayer').setup({
        width: 560,
        height: 316,
        playlist: [{ sources: options.videos }],
        events: {
            onBufferChange: function (e) {
                if (isNaN(e.duration)) {
                    jwplayer('videoPlayer').stop();

                    var error = { message: PlayerLabels.ErrorLoadPlayer };

                    SetInfoMessenge(error);

                    if (typeof options.onError == 'function')
                        options.onError(error);
                }
            },
            onReady: function () { },
            onBuffer: function () { $("#videoFechar").hide(); },
            onPlay: function () {
                $("#videoFechar").fadeIn();
                if (typeof options.onPlay == 'function')
                    options.onPlay();
            },
            onPause: function () { },
            onIdle: function () { $("#videoFechar").fadeIn(); },
            onComplete: function () {
                $("#videoFechar").fadeIn();
                $('#loadingBar').width('99.9%');
                if (typeof options.onComplete == 'function')
                    options.onComplete();
            },
            onError: function (e) {
                SetInfoMessenge(e);
                if (typeof options.onError == 'function')
                    options.onError(e);
            },
            onSetupError: function (e) {
                if (typeof options.onError == 'function')
                    options.onError(e);
            },
            onSeek: function (e) { },
            onTime: function (e) {
                var bar = e.position * 100 / e.duration;
                $('#loadingBar').width(bar + '%');
            }
        },
        primary: "html5",
        hlshtml: false,
        rtmp: { securetoken: '\x25\x66\x71\x21\x25\x66\x44\x69\x4A\x4E\x25\x43\x64\x74\x6B\x31\x4A\x75\x34\x54\x24\x21\x6A\x73\x23\x68\x23\x57\x70\x23\x50\x49\x69\x40\x23\x63\x4A\x67\x40\x6C' },
        flashplayer: urlroot + 'javascript/jwplayer/v7.8/jwplayer.flash.swf',
        autostart: true
    });
}

function ClosePlayer() {
    jwplayer('videoPlayer').stop();
    $('#video-player-shadow').hide();
    $('#video-content').hide();
    $("#videoFechar").hide();

    if (IDRequisito && VideoPlayerIsCompleted) {
        $('.play-' + IDRequisito + ' i').attr('class', 'uk-icon-curso-status-3');
    }
}

function SetPlayerResources() {
    if (document.getElementById('hddFileNotFound') != undefined) {
        PlayerLabels.FileNotFound = document.getElementById('hddFileNotFound').value;
        PlayerLabels.ErrorLoadFile = document.getElementById('hddErrorLoadFile').value;
        PlayerLabels.IncompatibleVersion = document.getElementById('hddIncompatibleVersion').value;
        PlayerLabels.RSSNotValid = document.getElementById('hddRSSNotValid').value;
        PlayerLabels.NoPlayerFallbackEnable = document.getElementById('hddNoPlayerFallbackEnable').value;
        PlayerLabels.NoPlayerFallbackDisable = document.getElementById('hddNoPlayerFallbackDisable').value;
        PlayerLabels.NotLoadPlugin = document.getElementById('hddNotLoadPlugin').value;
        PlayerLabels.NoSourcesFound = document.getElementById('hddNoSourcesFound').value;
        PlayerLabels.ErrorLoadPLaylist = document.getElementById('hddErrorLoadPLaylist').value;
        PlayerLabels.ErrorLoadPlayer = document.getElementById('hddErrorLoadPlayer').value;
    }
}

function SetInfoMessenge(e) {
    $('#videoPlayer').empty()
    if (e && e.message) {
        $('#videoPlayer').html('<p>' + e.message + '</p>');
    }
    else {
        $('#videoPlayer').html('<p>' + PlayerLabels.ErrorLoadPlayer + '</p>');
    }
    $("#videoFechar").fadeIn();
}