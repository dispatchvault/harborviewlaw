(function(){
try{
  var ASSETS="https://gassmarketingai.com/assets/";
  function addLink(href){var l=document.createElement("link");l.rel="stylesheet";l.href=href;document.head.appendChild(l);}
  function addScript(src,onload){var s=document.createElement("script");s.src=src;if(onload)s.onload=onload;document.head.appendChild(s);return s;}
  addLink(ASSETS+"vendor/cookieconsent/cookieconsent.css");
  addLink(ASSETS+"accessibility-widget.css");
  addScript(ASSETS+"vendor/cookieconsent/cookieconsent.umd.js",function(){
    addScript(ASSETS+"cookie-consent-init.js");
  });
  addScript(ASSETS+"accessibility-widget.js");
}catch(e){}
})();