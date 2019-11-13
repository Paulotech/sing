window.alert = window.console.log;
window.onload = initCourse;
window.onbeforeunload = window.onpagehide = window.onunload = fechouJanela;
window.onscroll = scroll;

// Armazena a API se houver
var scormAPI = getAPIHandle(window);

var travaInteracao = false;

// Scroll Bar
var winScroll = 0;
var widthBar = 0; 
var lessonLocation = "";
var lesson_Status = "";
var studentName = "";
var suspendData = "";
var score_raw = 0;
var interacoes_vistas = [];
var scrollAtual = 0;
var sections;
var section_atual = 0;
var mensagem;

function initCourse() {    
    if (scormAPI != null) {
        loadPage();
        verificaScorm();
    } else {
        separaDadosLMS();
    }    
}

function verificaScorm() {
    if (LMSIsInitialized()) {
        defineDadosCurso();
    } else {
        setTimeout(verificaScorm, 200);
    }
}

function defineDadosCurso() {
    console.log("Definindo dados do curso...");
    defineDados();
    separaDadosLMS();
}

function defineDados(){        
    lessonLocation = getLMSValue("cmi.core.lesson_location");
    lesson_Status = getLMSValue("cmi.core.lesson_status");
    studentName = getLMSValue("cmi.core.student_name");
    suspendData = getLMSValue("cmi.suspend_data");
    score_raw = getLMSValue("cmi.core.score.raw");     
}

function separaDadosLMS() {
    //deleteCookie("cmi.core.lesson_location"); 
    score_raw = 0;

    if (lessonLocation == "") {
        console.log("Dados do LMS não encontrados. Separando novos dados...");
        lessonLocation = getCookie("cmi.core.lesson_location");
        lesson_Status = getCookie("cmi.core.lesson_status");

        console.log("*"+lessonLocation+"*");
        
        if (lessonLocation != ""){
            if (lessonLocation.length > 1){
                scrollAtual = ~~lessonLocation.split("|")[0];
                interacoes_vistas = lessonLocation.split("|")[1].toString().split(",");                
                widthBar = ~~lessonLocation.split("|")[2];
            }
        };

    } else {
        console.log("Dados do LMS encontrados. Separando...");  
        scrollAtual = ~~lessonLocation.split("|")[0];      
        interacoes_vistas = lessonLocation.split("|")[1].toString().split(",");
        widthBar = ~~lessonLocation.split("|")[2];
    }

    console.log(widthBar);
    document.getElementById("myBar").style.width = widthBar + "%";

    iniciaCurso();
}


function gravaDados() {
    //console.log("gravaDados");
    lessonLocation = scrollAtual + "|" + interacoes_vistas.toString() + "|" + widthBar;

    if (scormAPI) {
        setLMSValue("cmi.core.lesson_location", lessonLocation);        
        if (lesson_Status == "completed") {
            console.log(lesson_Status);
            setLMSValue("cmi.core.lesson_status", lesson_Status, true);            
        }
    }else{
        if (lesson_Status == "completed"){
            console.log(lesson_Status);
            setCookie("cmi.core.lesson_status", lesson_Status, 99);            
        }
        setCookie("cmi.core.lesson_location", lessonLocation, 99);
    }
}

function getLMSValue(campo) {
    if (scormAPI) {
        return doLMSGetValue(campo);
    }

    return "";
}

function setLMSValue(campo, valor, commit) {
    var resultado = "";

    if (scormAPI) {
        resultado = doLMSSetValue(campo, valor);

        if (commit && resultado == "true") {
            doLMSCommit();
        }
    }

    return resultado;
}

function fechouJanela(event) {
    window.onbeforeunload = null;
    window.onpagehide = null;
    window.onunload = null;

    if (scormAPI != null) {
        unloadPage();                               
    }

    gravaDados();
}

function setCookie(cname, cvalue, exdays) {    
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();    

    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

function getCookie(cname) {  
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);

    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        };
        if (c.indexOf(name) == 0) {            
            return c.substring(name.length, c.length);
        };
    };  
    return "";
};

function deleteCookie(cname){
    document.cookie = cname+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

function exibeMensagemInteracao(texto){
    var orientacao = mensagem.querySelector(".orientation");
    var setaL = mensagem.querySelector(".arrowLeft");
    var setaD = mensagem.querySelector(".arrowDown");

    //mensagem.classList.remove("d-none");

    setaL.classList.remove("d-none");
    setaD.classList.add("d-none");

    orientacao.innerHTML = texto;
}

function exibeMensagem(){
    var orientacao = mensagem.querySelector(".orientation");
    var setaL = mensagem.querySelector(".arrowLeft");
    var setaD = mensagem.querySelector(".arrowDown");

   // mensagem.classList.remove("d-none");

    setaD.classList.remove("d-none");
    setaL.classList.add("d-none");

    orientacao.innerHTML = "Utilize o <i>scroll</i> para navegar.";
}

function ocultaMensagem(){
    mensagem.classList.add("d-none");
}

function iniciaCurso() {
    console.log("iniciaCurso...", "travaInteracao: "+travaInteracao);
    mensagem = document.querySelector(".arrows");   

    $("#accordion" ).accordion({
        heightStyle: "content",
        collapsible: true,
        active: false
    });

    winScroll = (document.body.scrollHeight || document.documentElement.scrollHeight) - window.innerHeight;            

    if (!travaInteracao){                
       $("#accordion .accordion-header").on("click", function (){            
            $(this).addClass("visto");
            this.parentNode.dataset.visto = "true";           
        });

        $(".card").flip();        
    }else{
        $("section").addClass("d-none");        
        sections = document.querySelectorAll("section");        

        for (var i = 0; i < sections.length; i++){
            interacoes_vistas.length < sections.length ? interacoes_vistas.push(0) : "";
            sections[i].id = "sc_"+i;        
        }

        exibeInteracao();
    }

    window.scrollTo(0, scrollAtual);
};

function exibeInteracao(){
    var interactions = [".container-video", ".accordion-header", ".card-content", ".audio-content"];

    if (sections[section_atual]){
        for (var j = 0; j < interactions.length; j++){            
            var int = sections[section_atual].querySelector(interactions[j]);
            var orientacao = mensagem.querySelector(".orientation");

            if (int){
                sections[section_atual].classList.remove("d-none");
                var tot_int = sections[section_atual].querySelectorAll(interactions[j]);

                if (j == 0){                    
                    if (interacoes_vistas[section_atual] == 1){
                        console.log('habilitaVideo');
                        var videoPlayer = int.querySelector("div");                     
                        videoPlayer.dataset.visto = "true";

                        finalizaInteracao(section_atual);
                    }else{
                        exibeMensagemInteracao("Assista ao Vídeo para prosseguir");
                    }
                }else if (j == 1){
                    console.log('habilitaAccordion');
                    habilitaAccordion(tot_int);                    
                }else if(j == 2){
                    console.log('habilitaCardItem');
                    habilitaCardItem(tot_int);
                }else if(j == 3){
                    if (interacoes_vistas[section_atual] == 1){               
                        console.log('habilitaAudio'); 
                        var audios = int.querySelector(".jwplayer");                        
                        audios.dataset.visto = "true";

                        finalizaInteracao(section_atual);
                    }else{                        
                        exibeMensagemInteracao("Ouça o podcast para prosseguir");
                    }
                }            
                return;
            }
        }

        interacoes_vistas[section_atual] = 1;
        sections[section_atual].classList.remove("d-none");
        finalizaInteracao(section_atual);
    }
}

function habilitaCardItem(itens){       
    var cards_ct = [];
    
    for(i = 0; i < itens.length; i++){
        cards_ct.push(0);
        itens[i].id = i;          
        if (interacoes_vistas[section_atual] == 1){
            itens[i].dataset.visto = "true";
        }     
    }

    $("#sc_"+section_atual+" .card").flip();    
    $("#sc_"+section_atual+" .card").on("click", function (){
        cards_ct[~~this.parentNode.id] = 1;        
        if (cards_ct.toString().indexOf("0") == -1 && !this.parentNode.dataset.visto){
            interacoes_vistas[section_atual] = 1;
            finalizaInteracao(section_atual);
            this.parentNode.dataset.visto = "true";
        }
        this.parentNode.dataset.visto = "true";
    })

    if (interacoes_vistas[section_atual] == 1){       
        finalizaInteracao(section_atual);
    }
}

function habilitaAccordion(itens){
    var cards_ct = [];
    
    for(i = 0; i < itens.length; i++){
        cards_ct.push(0);
        itens[i].id = i;       
    }

    $("#sc_"+section_atual+" #accordion .accordion-header").on("click", function (){
        cards_ct[~~this.id] = 1;
        $(this).addClass("visto");
        if (cards_ct.toString().indexOf("0") == -1 && !this.parentNode.dataset.visto){
            this.parentNode.dataset.visto = "true";            
            interacoes_vistas[section_atual] = 1;
            finalizaInteracao(section_atual);
        }
    });

    if (interacoes_vistas[section_atual] == 1){
        $("#sc_"+section_atual+" #accordion").data( "visto", "true");
        $("#sc_"+section_atual+" #accordion .accordion-header").addClass("visto");
        finalizaInteracao(section_atual);
    }else{
        var orientacao = mensagem.querySelector(".orientation");
        exibeMensagemInteracao("Veja todos os itens para prosseguir");
    }
}

function finalizaInteracao(atual){    
    var indice = interacoes_vistas.toString().split(",").join("").indexOf("0"); 

    if (atual <= indice && atual == section_atual){        
        section_atual ++;
        exibeInteracao();
    }else if (indice == -1){
        section_atual ++;
        exibeInteracao();
    }
}

function finalizaInteracaoVideo(obj){        
    if (travaInteracao){
        var doc = document.querySelector("#"+obj.id);
        var _bl = doc.dataset.visto == "true" ? true : false;        
        if (!_bl){
            doc.dataset.visto = "true";            
            interacoes_vistas[section_atual] = 1;        
            finalizaInteracao(section_atual);
        }

        exibeMensagem();  
    }
}

function scroll() {
    var winScrollTop = document.body.scrollTop || document.documentElement.scrollTop;   
    var scrolled_at = (winScrollTop / winScroll) * 100; 

    if(~~widthBar < ~~scrolled_at) {
        widthBar = ~~scrolled_at;
        document.getElementById("myBar").style.width = scrolled_at + "%"; 
        if(widthBar >= 100 && interacoes_vistas.toString().indexOf("0") == -1) {
            console.log("Completed!");
            lesson_Status = "completed";            
        }       

        scrollAtual = winScrollTop;        
    }

    //console.log(scrollAtual);
    gravaDados();

    AOS.init({
        easing: 'ease-in-out-sine'
    });

    var items = document.querySelectorAll("[anima]");
    for(i = 0; i < items.length; i++){
        var item = items[i];            
        if (item){
            item.setAttribute('data-aos', 'fade-up');
        }
    }   
}

function habilitaVideos(){
    console.log('habilitaVideos');
    var isStreaming = window.parent.streamingVideoFlag;
    var streamingURL = window.parent.generalMediaSource;
    var streamingProtocol = window.parent.streamingManifest;  

    var videos = document.querySelectorAll(".video");

    for (var i = 0; i < videos.length; i++){
        var urlAtual = videos[i].dataset.path;

        if(isStreaming) {
          urlAtual = streamingURL+urlAtual+streamingProtocol;          
        }
       
        var objVideo = {};
            objVideo.targetVideo = urlAtual;
            objVideo.poster = videos[i].dataset.poster;        
            objVideo.videoId = videos[i].id;                        
            openVideo(objVideo);
    }    
}

function openVideo(videoData){
    var videoId = videoData.videoId;    
    var videoPath = videoData.targetVideo;
    var videoPoster = videoData.poster;    

    var videoPlayer = document.getElementById(videoId);
    var player = jwplayer(videoPlayer).setup({
        file: videoPath,
        image: videoPoster,
        width: "100%",
        aspectratio: "16:9",
        minWidth: 600,
        //autostart: true,
        skin: {
            "name": "custom" 
        },                
        events: {
            onComplete: function(){                                
                finalizaInteracaoVideo(videoPlayer);
            },
            onPlay: function(){
                stopAllPlayer(videoId);
            }
        }
    });    
}

function stopAllPlayer(playerId){
    var players = document.querySelectorAll(".jwplayer");
    
    for(i = 0; i < players.length; i++){        
        if (playerId != players[i].id){            
            jwplayer(players[i]).stop();
        }
    }    
}

function habilitaAudio(){
    //Audios
    console.log('habilitaAudio');
    var playerInstance = [];
    var audios = document.querySelectorAll(".audio");

    console.log(audios);

    for (var i = 0; i < audios.length; i++){
        playerInstance[i] = jwplayer(audios[i].id);

        playerInstance[i].setup({
            file: "assets/midias/audios/"+audios[i].id+".mp3",
            width: "60%",
            height: 40,
            "skin": {
                "name": "custom-"+audios[i].id
            },
            events: {
                onComplete: function(){                                
                    finalizaInteracaoVideo(document.getElementById(this.id));
                },
                onPlay: function(){
                    stopAllPlayer(this.id);
                }
            }
        });
    }
}