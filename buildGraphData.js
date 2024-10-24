function buildGraphData(jsonObj) {
    const graphData = {
        NODES: [],
        LINES: [],
    };

    var currentKey = 0,
        currentLevel = 0,
        attributesArray = [];

    function checkIsImage(url) {
        // function to check if the url is an image (fetch method can be implemented in the future)
        return /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(url);
    }

    function addNode(title, shape, icon, image, status, attributes, keyParent) {
        // function to add a new node in the model
        currentKey++;
        graphData.NODES.push({
            KEY: currentKey,
            TITLE: title,
            SHAPE: shape,
            ICON: icon,
            IMAGE: image,
            STATUS: status,
            ATTRIBUTES: attributes,
            WIDTH: image ? 115 : null,
            HEIGHT: image ? 115 : null,
        });

        // create a line between the parent and the current node
        if (keyParent) addLine(keyParent, currentKey); // keyFrom, keyTo
    }

    function addLine(keyFrom, keyTo) {
        // function to add a new line in the model
        graphData.LINES.push({
            FROM: keyFrom,
            TO: keyTo
        });
    }

    function navigateInObj(obj, keyParent, parentIsArray) {
        // sort keys, first properties then objects / arrays
        var objKeys = Object.keys(obj).sort((a, b) => typeof obj[a] === 'object' ? 1 : typeof obj[b] === 'object' ? -1 : 0);

        // count non-object fields
        var countNonObj = objKeys.filter(a => typeof obj[a] !== 'object').length;

        if (currentLevel === 0 && objKeys.length > 0) {
            // in the first level add the circle node
            addNode("", "Circle", "sap-icon://syntax", "", "", [], keyParent); // title, shape, icon, image, status, attributes, keyParent
            keyParent = currentKey;
        }

        // reset variable
        attributesArray = [];

        // set new level
        currentLevel++;

        // loop all keys
        objKeys.forEach((field, countIndex) => {
            if (typeof obj[field] !== 'object') {
                // property
                attributesArray.push({
                    LABEL: field,
                    VALUE: obj[field],
                });
            } else {
                // array / object
                let nodeTitle = Array.isArray(obj[field]) ? `${field} (${obj[field].length})` : field;
                let nodeIcon = Array.isArray(obj[field]) ? "sap-icon://group-2" : "sap-icon://syntax";
                let nodeStatus = Array.isArray(obj[field]) ? "Error" : "Warning";
                if (keyParent) addNode(nodeTitle, "Box", nodeIcon, "", nodeStatus, [], keyParent); // title, shape, icon, image, status, attributes, keyParent

                if (Array.isArray(obj[field])) {
                    // loop the array and add field node or navigate inside the object
                    var keyParentArray = null;
                    obj[field].forEach((row, arrayIndex) => {
                        if (arrayIndex === 0) {
                            keyParentArray = currentKey;
                        }
                        if (typeof row !== 'object') {
                            // if the url is an image render it
                            let isImage = checkIsImage(row);
                            let arrayNodeTitle = isImage ? "" : row;
                            let arrayNodeImage = isImage ? row : "";
                            addNode(arrayNodeTitle, "Box", "", arrayNodeImage, "Success", [], keyParentArray); // title, shape, icon, image, status, attributes, keyParent
                        } else {
                            navigateInObj(row, keyParentArray, true); // obj, keyParent, parentIsArray
                        }
                    });
                } else {
                    navigateInObj(obj[field], currentKey, false); // obj, keyParent, parentIsArray
                }
            }

            if (countNonObj === countIndex + 1 && attributesArray.length) {
                // add the properties in a single node
                addNode("", "Box", "sap-icon://syntax", "", "Success", attributesArray, keyParent); // title, shape, icon, image, status, attributes, keyParent
                if (parentIsArray || currentLevel === 1) keyParent = currentKey;
            }
        });
    }

    // call the recursive function to navigate inside all JSON objects
    navigateInObj(jsonObj, null, false); // obj, keyParent, parentIsArray
    return graphData;
}
