module FamilyTreePrinter {

    export class DataProcessor {

        public rootNode: PersonNode;

        private idToPersonMap: IMap<PersonNode>;

        process(nodes: IPersonData[], spouses: ISpouseData[]) {
            let childrenToAddLater: IMap<PersonNode[]> = {};

            // create basic node obj
            this.idToPersonMap = nodes.reduce((idToNodeMap, nodeData) => {
                idToNodeMap[nodeData.id] = new PersonNode(nodeData);

                // check if there were any children nodes initialized earlier
                if (childrenToAddLater[nodeData.id]) {
                    childrenToAddLater[nodeData.id].forEach(child => idToNodeMap[nodeData.id].children.push(child));
                    delete childrenToAddLater[nodeData.id];
                }

                // if there is no parent it is the root node
                if (!nodeData.parent) {
                    this.rootNode = idToNodeMap[nodeData.id];
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
            }, {} as IMap<PersonNode>);

            return this;
        }
    }
}