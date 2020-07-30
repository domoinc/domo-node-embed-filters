function getGeneratedPageURL(embedToken, embedUrl) { 
    const source = '' +
        "<html>\n" +
        "   <body>\n" + 
        "        <form id=\"form\" action=\"" + embedUrl + "\" method=\"post\">\n" + 
        "        <input type=\"hidden\" name=\"embedToken\" value=\"" + embedToken + "\">\n" + 
        "        </form>\n" + 
        "        <script>\n" + 
        "        document.getElementById(\"form\").submit();\n" + 
        "        </script>\n" +
        "    </body>\n" +
        "</html>\n";

    return source;
}

function reqListener () {
    if (this.status === 200) {
        const iframe = document.getElementById('iframe');
        const json = JSON.parse(this.response);
        const src = getGeneratedPageURL(json.embedToken, json.embedUrl)
        iframe.srcdoc = src;

        const supportsSrcdoc = ('srcdoc' in document.createElement('iframe'));
        if (!supportsSrcdoc) {
            iframe.dataset.src = src;
            const js = 'javascript: window.frameElement.getAttribute("data-src")';
            iframe.setAttribute('src', js);
            iframe.contentWindow.location = js;
          }
    }
}

function transferFailed(evt) {
    console.log("An error occurred while processing the request.", evt, evt.message, evt.error.stack, evt.error);
}
var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.addEventListener("error", transferFailed);
oReq.open("GET", "/embed/items/1");
oReq.setRequestHeader('authToken', 'importAuthTokenExample-239842alvanv98arkfjsd9a8hb')
oReq.send();
