var GPP_TITLE = "Wool Idle";
var GPP_ID_TITLE = "Wool_Idle";
var GPP_VERSION = "p1.0.0";
var GPP_IOS_APP_STORE_URL = "{GPP_IOS_APP_STORE_URL}";
var GPP_GOOGLE_PLAY_MARKET_URL = "{GPP_GOOGLE_PLAY_MARKET_URL}";
var GPP_DESTINATION_URL = (/android/i.test(navigator.userAgent))? GPP_GOOGLE_PLAY_MARKET_URL : GPP_IOS_APP_STORE_URL;
var GPP_NETWORK = "{GPP_NETWORK}";
var GPP_LANG = "{PLAYABLE_LANG}";
var ORIGINAL_LANG = {"PLAY_NOW": "play now"}

var GPP_OPTION = {
    VARIATION_WORLD: "{VARIATION_WORLD}",
    VARIATION_ANIMAL: "{VARIATION_ANIMAL}",
    VARIATION_MECHANIC: "{VARIATION_MECHANIC}",
    IS_WEATHER: false
}

if (typeof GPG_TEMPLATE_DEFAULT !== 'undefined') {
    GPP_OPTION.VARIATION_WORLD = "A", GPP_OPTION.VARIATION_ANIMAL = "A", GPP_OPTION.VARIATION_MECHANIC = "A";
}