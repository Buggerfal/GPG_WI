var ITMUSTBEIGNORED;

GPG_TEMPLATE_DEFAULT.GPP_TITLE_TEMPLATE = "{EXCH}_{PLAYABLE}_{VARIANT}_{WORLD}_{CLIMBER}_{DEV_VERSION}"
document.getElementById("title_temp").value = GPG_TEMPLATE_DEFAULT.GPP_TITLE_TEMPLATE

function imageChanges(label, msg) {
    function imageReady(img) {
        bootbox.alert({
            message: document.getElementById('toremove').innerHTML.replace('{MESSAGE}', msg).replace('another4', '1').replace('another1', '1').replace('another2', '1').replace('another3', '1'),//'Select animation image quality. Remember more quality - more memory (download time)',
            callback: function () {
                var result = document.getElementById('imgqualtu_1').value
                if (result) {
                    
                } else {
                    GPG_alert('Image will with 100% quality')
                    result = 300
                }

                var result_scale = document.getElementById('imgscale_1').value
                if (result_scale) {
                    result_scale = result_scale / 100
                } else {
                    GPG_alert('Image will with 80% scale')
                    result_scale = 0.8
                }

                var img_type = "image/png"
                if (document.getElementById('jpeg_checked_1').checked)
                    img_type = "image/jpeg"

                getConvertedImage(img, function(res) {
                    window.gameResources[label] = res
                    document.getElementById('resources').innerHTML = 'window.gameResources=' + JSON.stringify(window.gameResources) + ';\n';
                    // simpleLoadImage(res, function(img_in) {
                    //     window.gameResources[label] = img_in.src
                    // })
                }, result_scale, result, img_type)
            }
        });
        //window.gameResources[label] = img.src
    }
    var t = getElmnt(label)

    if (t.files.length > 0) {
        loadImage(t.files[0], function(img) {
            imageReady(img)
        })
    } else {
        var d = getElmnt(label + '_value').value
        if (d && (d.indexOf('http') > -1 || d.indexOf('data') > -1)) {
            toDataURL(d, function(dataUrl) {
                imageReady(dataUrl)
            })
        } else {
            GPG_alert('Choose file or or paste url first')
        }
    }
}

function applyConfigAndRestart() {
    var e = document.getElementById("world_pl");
    var world_ch = e.options[e.selectedIndex].value || 'A';
    var world_str = e.options[e.selectedIndex].text || 'Green';

    e = document.getElementById("animal_pl");
    var animal_ch = e.options[e.selectedIndex].value || 'A';
    var animal_str = e.options[e.selectedIndex].text || 'Sheep';

    e = document.getElementById("mechanic");
    var mechanic_ch = Number(e.options[e.selectedIndex].value || 'A');
    var mechanic_str = e.options[e.selectedIndex].text || 'Level';


    e = document.getElementById("playable_lang");
    var pl_lang = e.options[e.selectedIndex].value || 'en';

    e = document.getElementById('is_lang_auto_detect')
    if (e.checked)
        pl_lang = 'auto'


    GPP_OPTION.VARIATION_WORLD = world_ch
    GPP_OPTION.VARIATION_ANIMAL = animal_ch
    GPP_OPTION.VARIATION_MECHANIC = mechanic_ch

    // if (GPP_OPTION.VARIATION_WORLD == "A" || GPP_OPTION.VARIATION_WORLD == "B")
    //     window.gameResources.mountain = window.resourcesPack.mountain
    // if (GPP_OPTION.VARIATION_WORLD == "C" || GPP_OPTION.VARIATION_WORLD == "B") {
    //     window.gameResources.crystalMountain = window.resourcesPack.crystalMountain
    //     window.gameResources.light = window.resourcesPack.light
    // }

    GPP_LANG = pl_lang

    game.destroy()
    GameIndex.init()
}

getIronSourceTag = function(title, params_to_ch) {
    var GPG_config_from_html = document.getElementById('gpg_config').innerHTML;

    var i_tag = '' +
        '<meta name="mobile-web-app-capable" content="yes">' +
        '<meta name="apple-mobile-web-app-capable" content="yes">' +
        '<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=0,viewport-fit=cover,minimal-ui">' +
        '{STYLES_FOR_PLAYABLE}' +
        '<style>body,html{margin:0;padding:0}html{background-color:#fff;overflow:hidden;width:100%}body{background-color:#fff;height:inherit;width:inherit;display:flex;justify-content:center;align-items:center}*{-webkit-tap-highlight-color:transparent}body>.errorify{color:red;font-family:\'Consolas\',monospace;padding:5px 10px}</style>' +
        '<script type="text/javascript">' +
            GPG_config_from_html + 
        '<\/script>' +
        '{SCRYPTS_FOR_PLAYABLE}' +
        '<div id = "content"></div>';

    if (params_to_ch.css) {
        var styles = ""
        for (var i in params_to_ch.css) {
            styles += '<link rel="stylesheet" type="text/css" href="' + params_to_ch.css[i] + '">'
        }
    }

    if (params_to_ch.js) {
        var jss = ""
        for (var i in params_to_ch.js) {
            if (params_to_ch.js[i].indexOf('gpg_config.js') > -1 || params_to_ch.js[i].indexOf('gpg_template_config.js') > -1)
                continue
            jss += '<script type="text/javascript" src="' + params_to_ch.js[i] + '"><\/script>'
        }
    }

    for (var i in params_to_ch) {
        if (i == 'css' || i == 'js')
            continue
        i_tag = i_tag.replace(i, params_to_ch[i])
    }
    i_tag = i_tag.replace('{STYLES_FOR_PLAYABLE}', styles)
    i_tag = i_tag.replace('{SCRYPTS_FOR_PLAYABLE}', jss)

    downloadFile(i_tag, title)  
}

function generateZipForGoogle(content, title) {
    var zip = new JSZip();
    zip.file("index.html", content);
    zip.generateAsync({type: "blob"})
    .then(function(content_blb) {
        // see FileSaver.js
        saveAs(content_blb, title + ".zip");
    });
}

function generateZipForMintegral(content, title) {
    var zip = new JSZip();
    zip.file(title + ".html", content);
    zip.generateAsync({type: "blob"})
    .then(function(content_blb) {
        // see FileSaver.js
        saveAs(content_blb, title + ".zip");
    });
}

generatePlayable = function(option) {
    var params_for_iron = {}
    var dc = document.head.innerHTML
    var bc = document.body.innerHTML

    var e = document.getElementById("network_exch");
    var network_exch = e.options[e.selectedIndex].value || 'preview';
    var network_exch_str = e.options[e.selectedIndex].text || 'Preview';

    e = document.getElementById("ios_url");
    var app_store_url = e.value || GPG_TEMPLATE_DEFAULT.GPG_STORES_URL[GPG_TEMPLATE_DEFAULT.GPG_PLAYABLE_ID].ios_url

    e = document.getElementById("android_url");
    var android_url = e.value || GPG_TEMPLATE_DEFAULT.GPG_STORES_URL[GPG_TEMPLATE_DEFAULT.GPG_PLAYABLE_ID].android_url

    e = document.getElementById("google_width");
    var google_width = Number(e.value) || 480

    e = document.getElementById("google_height");
    var google_height = Number(e.value) || 320

    e = document.getElementById("playable_lang");
    var pl_lang = e.options[e.selectedIndex].value || 'en';

    e = document.getElementById('is_lang_auto_detect')
    if (e.checked)
        pl_lang = 'auto'



    dc = dc.replace('{GPP_NETWORK}', network_exch)
    dc = dc.replace('{GPP_GOOGLE_PLAY_MARKET_URL}', android_url)
    dc = dc.replace('{GPP_IOS_APP_STORE_URL}', app_store_url)
    dc = dc.replace('{GOOGLE_ADS_WIDTH}', google_width)
    dc = dc.replace('{GOOGLE_ADS_HEIGHT}', google_height)
    dc = dc.replace('{PLAYABLE_LANG}', pl_lang)

    params_for_iron['{GPP_NETWORK}'] = network_exch
    params_for_iron['{GPP_GOOGLE_PLAY_MARKET_URL}'] = android_url
    params_for_iron['{GPP_IOS_APP_STORE_URL}'] = app_store_url
    params_for_iron['{PLAYABLE_LANG}'] = pl_lang


    var e = document.getElementById("world_pl");
    var world_ch = e.options[e.selectedIndex].value || 'A';
    var world_str = e.options[e.selectedIndex].text || 'Green';
    world_str = version_str.split(' ').join('_')

    e = document.getElementById("animal_pl");
    var animal_ch = e.options[e.selectedIndex].value || 'A';
    var animal_str = e.options[e.selectedIndex].text || 'Sheep';
    animal_str = background_str.split(' ').join('_')

    e = document.getElementById("mechanic");
    var mechanic_ch = Number(e.options[e.selectedIndex].value || 'A');
    var mechanic_str = e.options[e.selectedIndex].text || 'Level';
    mechanic_str = background_str.split(' ').join('_')


    dc = dc.replace('{VARIATION_WORLD}', world_ch)
    dc = dc.replace('{VARIATION_ANIMAL}', animal_ch)
    dc = dc.replace('"{VARIATION_MECHANIC}"', mechanic_ch)

    params_for_iron['{VARIATION_WORLD}'] = world_ch
    params_for_iron['{VARIATION_ANIMAL}'] = animal_ch
    params_for_iron['{VARIATION_MECHANIC}'] = mechanic_ch

    // if (background_ch == "A" || background_ch == "B") {
    //     dc = dc.replace('{STANDART_MOUNTAIN}', window.resourcesPack.mountain)
    //     params_for_iron['{STANDART_MOUNTAIN}'] = window.resourcesPack.mountain
    // } 

    // if (background_ch == "C" || background_ch == "B") {
    //     dc = dc.replace('{CRYSTAL_MOUNTAIN}', window.resourcesPack.crystalMountain)
    //     params_for_iron['{CRYSTAL_MOUNTAIN}'] = window.resourcesPack.crystalMountain

    //     dc = dc.replace('{LIGHT_IMG}', window.resourcesPack.light)
    //     params_for_iron['{LIGHT_IMG}'] = window.resourcesPack.light
    // }

    var is_dapi = false
    if (option != void 0) {
        if (option.dapi) {
            is_dapi = true
            dc = dc.replace('<meta name="external_library">', '<script>function getScript(e,i){var n=document.createElement("script");n.type="text/javascript",n.async=!0,i&&(n.onload=i),n.src=e,document.head.appendChild(n)}function parseMessage(e){var i=e.data,n=i.indexOf(DOLLAR_PREFIX+RECEIVE_MSG_PREFIX);if(-1!==n){var t=i.slice(n+2);return getMessageParams(t)}return{}}function getMessageParams(e){var i,n=[],t=e.split("/"),a=t.length;if(-1===e.indexOf(RECEIVE_MSG_PREFIX)){if(a>=2&&a%2===0)for(i=0;a>i;i+=2)n[t[i]]=t.length<i+1?null:decodeURIComponent(t[i+1])}else{var o=e.split(RECEIVE_MSG_PREFIX);void 0!==o[1]&&(n=JSON&&JSON.parse(o[1]))}return n}function getDapi(e){var i=parseMessage(e);if(!i||i.name===GET_DAPI_URL_MSG_NAME){var n=i.data;getScript(n,onDapiReceived)}}function invokeDapiListeners(){for(var e in dapiEventsPool)dapiEventsPool.hasOwnProperty(e)&&dapi.addEventListener(e,dapiEventsPool[e])}function onDapiReceived(){dapi=window.dapi,window.removeEventListener("message",getDapi),invokeDapiListeners()}function init(){window.dapi.isDemoDapi&&(window.parent.postMessage(DOLLAR_PREFIX+SEND_MSG_PREFIX+JSON.stringify({state:"getDapiUrl"}),"*"),window.addEventListener("message",getDapi,!1))}var DOLLAR_PREFIX="$$$$",RECEIVE_MSG_PREFIX="DAPI_SERVICE:",SEND_MSG_PREFIX="DAPI_AD:",GET_DAPI_URL_MSG_NAME="connection.getDapiUrl",dapiEventsPool={},dapi=window.dapi||{isReady:function(){return!1},addEventListener:function(e,i){dapiEventsPool[e]=i},removeEventListener:function(e){delete dapiEventsPool[e]},isDemoDapi:!0};init();<\/script>')
        }
    }

    dc = dc.replace('<meta name="external_library">', "")

    e = document.getElementById("title_temp");
    var title_template_str = e.value || GPG_TEMPLATE_DEFAULT.GPP_TITLE_TEMPLATE

    title_template_str = title_template_str.replace('{EXCH}', network_exch_str)
    if (network_exch == "google") {
        if (google_width > google_height)
            title_template_str = 'Landscape_' + title_template_str
        else
            title_template_str = 'Portrait_' + title_template_str
    }
    title_template_str = title_template_str.replace('{PLAYABLE}', GPP_ID_TITLE)

    title_template_str = title_template_str.replace('{VARIANT}', version_str)
    title_template_str = title_template_str.replace('{WORLD}', background_str)
    title_template_str = title_template_str.replace('{CLIMBER}', climber_str)

    if (typeof DEV_VERSION !== "undefined") 
        title_template_str = title_template_str.replace('{DEV_VERSION}', DEV_VERSION)
    else
        title_template_str = title_template_str.replace('{DEV_VERSION}', 'v0')

    if (network_exch == 'ironsource') {
        if (is_dapi) {
            title_template_str += '.html'
            downloadFile('<!DOCTYPE html><html lang="en"><head>' + dc + '</head> <body><div id = "content"></div></body></html>', title_template_str)
        } else {
            title_template_str += '.txt'
            var js_url = document.getElementById("iron_script").value || ''
            var css_url = document.getElementById("iron_style").value || ''

            params_for_iron.js = []
            params_for_iron.css = []
            if (js_url) {
                params_for_iron.js.push(js_url)
            } else {
                params_for_iron.js = list_of_scripts
            }
            if (css_url) {
                params_for_iron.css.push(css_url)
            } else {
                params_for_iron.css = list_of_styles
            }
            if (!js_url || !css_url) {
                if (typeof bootbox != 'undefined') {
                    bootbox.confirm("The playable will be generate with last scripts and styles from GitHub CDN!", function(result) {
                        if (result)
                            getIronSourceTag(title_template_str, params_for_iron)
                    });
                } else {
                  alert('The playable will be generate with last scripts and styles from GitHub CDN!')
                  getIronSourceTag(title_template_str, params_for_iron)
                }
            } else {
                getIronSourceTag(title_template_str, params_for_iron)
            }
        }
    } else if (network_exch == 'google') {
        generateZipForGoogle('<!DOCTYPE html><html lang="en"><head>' + dc + '</head> <body><div id = "content"></div></body></html>', title_template_str)
    } else if (network_exch == "mintegral") {
        generateZipForMintegral('<!DOCTYPE html><html lang="en"><head>' + dc + '</head> <body><div id = "content"></div></body></html>', title_template_str)
    } else {
      title_template_str += '.html'
      downloadFile('<!DOCTYPE html><html lang="en"><head>' + dc + '</head> <body><div id = "content"></div></body></html>', title_template_str)
    }
}