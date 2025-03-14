document.addEventListener('DOMContentLoaded', () => {
    const selectElementHTML = document.getElementById('content-select');
    const selectElementXML = document.getElementById('content-select-xml');
    const iframe = document.getElementById('content-iframe');

    function loadContent(file, type) {
        if (!file) return;

        if (type === 'html') {
            iframe.src = `./${file}.html`;
        } else if (type === 'xml') {
            fetch(`./${file}.xml`)
                .then(response => {
                    if (!response.ok) throw new Error("Failed to fetch XML.");
                    return response.text();
                })
                .then(xmlText => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
                    const xsltProcessor = new XSLTProcessor();

                    return fetch('./summary/transform.xslt')
                        .then(response => {
                            if (!response.ok) throw new Error("Failed to fetch XSLT.");
                            return response.text();
                        })
                        .then(xsltText => {
                            const xsltDoc = parser.parseFromString(xsltText, 'application/xml');
                            xsltProcessor.importStylesheet(xsltDoc);

                            const resultDocument = xsltProcessor.transformToDocument(xmlDoc);
                            const resultHtml = new XMLSerializer().serializeToString(resultDocument);

                            iframe.contentDocument.open();
                            iframe.contentDocument.write(resultHtml);
                            iframe.contentDocument.close();
                        });
                })
                .catch(error => {
                    console.error(error);
                    iframe.contentDocument.open();
                    iframe.contentDocument.write(`<p style="color: red;">${error.message}</p>`);
                    iframe.contentDocument.close();
                });
        }
    }

    selectElementHTML.addEventListener('change', (event) => {
        loadContent(event.target.value, 'html');
    });

    selectElementXML.addEventListener('change', (event) => {
        loadContent(event.target.value, 'xml');
    });

    // Load default content
    if (selectElementHTML.value) {
        loadContent(selectElementHTML.value, 'html');
    } else if (selectElementXML.value) {
        loadContent(selectElementXML.value, 'xml');
    }
});
