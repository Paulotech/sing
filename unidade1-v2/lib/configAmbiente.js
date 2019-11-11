/**
 * Configura a peça de acordo com o ambiente que se está rodadando
 * (app ou desktop) e de acordo com se os videos sao por streaming
 * ou por download
 * 
 * COMO USAR: 
 * 1) Coloque este arquivo na pasta js e o arquivo configuracoes.js na raiz do projeto
 * 2) chame este arquivo no index.html, apos a ultima chamada de lib
 * 3) retire a chamada do plugin jwplayer do index.html
 * 4) chame a function montaAmbienteTelas() no inicio da funcao iniciar() em js/app.js
 * 
 * @author bk_felipe.alves@ciatech.com.br
 */


/** vars streaming */
var streamingVideoFlag,
streamingAudioFlag = false,
itemIdForMedia = idPeca, //idPeca = global configuracoes.js
tipoVideo = "singularidades",
//generalMediaSource = "https://stream.ciatech.com.br/vod/mp4:default/"+tipoVideo+"/"+itemIdForMedia+"/",
generalMediaSource = "https://stream.ciatech.com.br/vod_cia/mp4:default/"+tipoVideo+"/"+itemIdForMedia+"/",
streamingManifest = "/playlist.m3u8";


montaAmbienteIndex();


/**
 * Função que chama todas as funções responsaveis por alterar a peça de acordo com o ambiente
 * usadas pós carregamento das telas
 */
function montaAmbienteTelas(){

    if(isMobile() ){
        adaptaMobileTelas();
    } else{
        adaptaDesktopTelas();
    }

}

/**
 * Função que chama todas as funções responsaveis por alterar a peça de acordo com o ambiente
 * que devem ser chamadas IMEDIATAMENTE 
 */
function montaAmbienteIndex(){

    if(isMobile() ){
        adaptaMobileIndex();
    } else{
        adaptaDesktopIndex();
    }

    //global configuracoes.js
    if(isStreaming){
        adaptaStreamingVideos();
    } else{
        adaptaDownloadVideos();
    }
}

/**
 * Agrupa todas as funções para adaptar para mobile (app)
 * pós carregamento do index
 */
function adaptaMobileIndex(){
    versaoPlayerMobile();
}

/**
 * Agrupa todas as funções para adaptar para desktop
 * pós carregamento do index
 */
function adaptaDesktopIndex(){
    versaoPlayerDesktop();
}

/**
 * Agrupa todas as funções para adaptar para mobile (app)
 * pós carregamento da tela
 */
function adaptaMobileTelas(){
    targetAnexosSelf();
    anexoHtml();
}
/**
 * Agrupa todas as funções para adaptar para desktop (app)
 */
function adaptaDesktopTelas(){
    targetAnexosBlank();
}

/**
 * Agrupa todas as funções para adaptar para download de video
 */
function adaptaDownloadVideos(){
    streamingVideoFlag = false;
}

/**
 * Agrupa todas as funções para adaptar para streaming de video
 */
function adaptaStreamingVideos(){
    streamingVideoFlag = true;
}

/**
 * Muda o target de todos os links anexos para abrir na propria aba
 */
function targetAnexosSelf(){
    $('a[href^="anexos"]').each(function(){
        $(this).attr('target','_self');
    });
}

/**
 * Muda o target de todos os links anexos para abrir em outra aba
 */
function targetAnexosBlank(){
    $('a[href^="anexos"]').each(function(){
        $(this).attr('target','_blank');
    });
}

/**
 * Carrega a versao do player usado em desktop
 */
function versaoPlayerDesktop(){
    console.log('versaoPlayerDesktop');
    var versaoPlayer = '7.8.6';
    head.load("lib/jwplayer-"+versaoPlayer+"/jwplayer.js",function(){
        jwplayer.key = "vIVdK0Vj+Z7gOrdH/GLp4SmrpAcEUGfYYJxqhODNFgo=";
        window.parent.habilitaVideos();
        window.parent.habilitaAudio();
    });
}

/**
 * Carrega a versao do player usado em mobile (app)
 */
function versaoPlayerMobile(){
    console.log('versaoPlayerMobile');
    var versaoPlayer = '7.2.3';
    head.load("lib/jwplayer-"+versaoPlayer+"/jwplayer.js",function(){
        jwplayer.key = "vIVdK0Vj+Z7gOrdH/GLp4SmrpAcEUGfYYJxqhODNFgo=";
        window.parent.habilitaVideos();        
        window.parent.habilitaAudio();        
    });
}

/**
 * Garante que o anexo sempre seja um HTML no mobile (app)
 */
function anexoHtml(){
    console.log('anexoHTML');
    $('a[href$=".pdf"]').each(function(){
        var url = $(this).attr('href');
        var urlQuebrada = url.split(".");
        var extensao = 'html';
        var novaUrl = urlQuebrada[0]+'.'+extensao;
        console.log(novaUrl)
        $(this).attr('href', novaUrl);
    });
}

function isMobile(){
    return is.mobile() || is.tablet();
};