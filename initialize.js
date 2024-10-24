sap.ui.getCore().attachInit(function (data, navObj) {
    // when the HTMLObject is rendered create the monaco editor in the div element
    HTMLObject.addEventDelegate({
        onAfterRendering: function () {
            const monacoEditor = monaco.editor.create(document.getElementById("jsonEditor"), {
                automaticLayout: true,
                language: 'json',
                theme: "vs-dark",
                formatOnPaste: true,
            });

            // when the editor content is changed update the graph model
            monacoEditor.onDidChangeModelContent(function (e) {
                try {
                    const jsonString = monacoEditor.getValue().replaceAll("\n", "");
                    if (!jsonString) throw "Empty JSON.";

                    const jsonObj = JSON.parse(jsonString);
                    if (!Object.keys(jsonObj)) throw "Invalid JSON.";

                    modelGraph.setData(buildGraphData(jsonObj));
                    modelGraph.refresh(true);
                } catch (err) {
                    sap.m.MessageToast.show(err);
                    modelGraph.setData([]);
                    modelGraph.refresh(true);
                }
            });
        }
    });

    modelGraph.setSizeLimit(10000); // change the size limit if needed for larger json
});