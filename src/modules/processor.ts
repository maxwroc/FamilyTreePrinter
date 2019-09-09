module FamilyTreePrinter {

    export class DataProcessor {

        public rootNode: PersonNode;

        private idToPersonMap: IMap<PersonNode>;

        process(nodes: IPersonData[], spouses: ISpouseData[]) {

            // create main tree nodes (PersonNodes)
            this.idToPersonMap = nodes.reduce(
                (idToNodeMap, nodeData) => this.processPerson(idToNodeMap, nodeData),
                {} as IMap<PersonNode>);

            spouses.forEach(spouseData => {
                let spouse = new SpouseNode(spouseData);
                // add children
                spouseData.children && spouseData.children.forEach(childId => spouse.children.push(this.idToPersonMap[childId]));

                // add spouse to person node
                this.idToPersonMap[spouseData.partner].spouses.push(spouse);
                // add person to spouse node
                spouse.partner = this.idToPersonMap[spouseData.partner];
            });

            return this;
        }

        private processPerson(idToNodeMap: IMap<PersonNode>, nodeData: IPersonData): IMap<PersonNode> {
            let childrenToAddLater: IMap<PersonNode[]> = {};
            return (() => {
                idToNodeMap[nodeData.id] = new PersonNode(nodeData);

                // check if there were any children nodes initialized earlier
                if (childrenToAddLater[nodeData.id]) {
                    childrenToAddLater[nodeData.id].forEach(child => {
                        idToNodeMap[nodeData.id].children.push(child);
                        // add parent to child
                        child.parent = idToNodeMap[nodeData.id];
                    });
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
                        // add parent to child
                        idToNodeMap[nodeData.id].parent = idToNodeMap[nodeData.parent];
                    }
                    else {
                        // since parent was not initialized yet we store new node in helper collection and we will add it later
                        childrenToAddLater[nodeData.parent] = childrenToAddLater[nodeData.parent] || [];
                        childrenToAddLater[nodeData.parent].push(idToNodeMap[nodeData.id]);
                    }
                }

                return idToNodeMap;
            })();
        }
    }
}