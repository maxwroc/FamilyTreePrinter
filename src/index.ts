/**
 * FamilyTreePrinter - index
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/FamilyTreePrinter/
 */
module FamilyTreePrinter {

    // tree data
    let treeData: IPersonData[] = [
        { id: 1, name: "A", sex: "m" },
        { id: 2, name: "B", sex: "f", parent: 1 },
        { id: 3, name: "C", sex: "f", parent: 1 },
        { id: 4, name: "D", sex: "m", parent: 1 },
        { id: 5, name: "E", sex: "m", parent: 4 },
        { id: 6, name: "F", sex: "m", parent: 4 },
        { id: 7, name: "G", sex: "f", parent: 4 },
        { id: 8, name: "H", sex: "f", parent: 2 },
        { id: 9, name: "I", sex: "f", parent: 2 },
    ];

    let spouses: ISpouseData[] = [
        { id: 1, name: "SA_2", sex: "f", partner: 1, since: "2015-10-01", children: [1] }, // current
        { id: 2, name: "SA_1", sex: "f", partner: 1, since: "2010-09-20", children: [2, 3], till: "2015-05-18" }, // ex
        { id: 3, name: "SD_1", sex: "f", partner: 4, since: "2015-05-20", children: [5, 6, 7] }, // current
        { id: 4, name: "SB_1", sex: "m", partner: 2, since: "2015-05-20", children: [8, 9] } // current
    ];

    function processDataAndGetRootNode(treeData: IPersonData[]): Node {
        let root: Node = null;
        // helper collectiont to store
        let childrenToAddLater: IMap<Node[]> = {};

        // create basic node obj
        treeData.reduce((idToNodeMap, nodeData) => {
            idToNodeMap[nodeData.id] = new PersonNode(nodeData);

            // check if there were any children nodes initialized earlier
            if (childrenToAddLater[nodeData.id]) {
                childrenToAddLater[nodeData.id].forEach(child => idToNodeMap[nodeData.id].children.push(child));
                delete childrenToAddLater[nodeData.id];
            }

            // if there is no parent it is the root node
            if (!nodeData.parent) {
                root = idToNodeMap[nodeData.id];
            }
            else {
                // check if parent was initialized already
                if (idToNodeMap[nodeData.parent]) {
                    // add child to the parent
                    idToNodeMap[nodeData.parent].children.push(idToNodeMap[nodeData.id]);
                }
                else {
                    // since parent was not initialized yet we store new node in helper collection and we will add it later
                    childrenToAddLater[nodeData.parent] = childrenToAddLater[nodeData.parent] || [];
                    childrenToAddLater[nodeData.parent].push(idToNodeMap[nodeData.id]);
                }
            }
            return idToNodeMap;
        }, {} as IMap<Node>);

        return root;
    }

    window.addEventListener("load", () => {
        Canvas.drawTree(processDataAndGetRootNode(treeData));
    });
}