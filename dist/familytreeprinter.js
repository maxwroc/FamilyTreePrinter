"use strict";
/**
 * FamilyTreePrinter - index
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/FamilyTreePrinter/
 */
var FamilyTreePrinter;
/**
 * FamilyTreePrinter - index
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/FamilyTreePrinter/
 */
(function (FamilyTreePrinter) {
    // tree data
    let treeData = [
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
    let spouses = [
        { id: 1, name: "SA_2", sex: "f", partner: 1, since: "2015-10-01", children: [1] },
        { id: 2, name: "SA_1", sex: "f", partner: 1, since: "2010-09-20", children: [2, 3], till: "2015-05-18" },
        { id: 3, name: "SD_1", sex: "f", partner: 4, since: "2015-05-20", children: [5, 6, 7] },
        { id: 4, name: "SB_1", sex: "m", partner: 2, since: "2015-05-20", children: [8, 9] } // current
    ];
    window.addEventListener("load", () => {
        FamilyTreePrinter.Canvas.drawTree(new FamilyTreePrinter.DataProcessor().process(treeData, spouses).rootNode);
    });
})(FamilyTreePrinter || (FamilyTreePrinter = {}));
/**
 * FamilyTreePrinter - canvas
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/FamilyTreePrinter/
 */
var FamilyTreePrinter;
/**
 * FamilyTreePrinter - canvas
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/FamilyTreePrinter/
 */
(function (FamilyTreePrinter) {
    var Canvas;
    (function (Canvas) {
        /**
         * Creates SVG and returns container for drawing the tree
         */
        function getContainer() {
            const svg = d3.select("body").append("svg")
                .attr("width", "100%")
                .attr("height", "100%");
            // background elem used for zooming and moving
            const background = svg.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "#F2EEE4")
                .style("pointer-events", "all")
                .style("cursor", "grab");
            // main container where the tree is going to be drawn
            const container = svg.append("g")
                .style("vector-effect", "non-scaling-stroke");
            // create zoom event handler
            const zoom = d3.behavior.zoom()
                .scaleExtent([1, 10])
                .on("zoom", () => {
                let evt = d3.event;
                container.attr("transform", "translate(" + evt.translate + ")scale(" + evt.scale + ")");
            });
            // add zoom handler to the background
            background.call(zoom);
            return container;
        }
        /**
         * Walks over the tree (postorder) and draws the nodes starting from most left descendant.
         *
         * Nodes will be printed in the following order:
         *             12
         *      ┍------+-----┑
         *      6            11
         *   ┍--+--┑      ┍--+--┑
         *   1     5      7     10
         *      ┍--|--┑      ┍--+--┑
         *      2  3  4      8     9
         */
        function drawSubTree(node, x, depth, container) {
            for (const child of node.children) {
                x = drawSubTree(child, x, depth + 1, container);
            }
            ;
            return node.print(container, x, depth);
        }
        function drawTree(root) {
            drawSubTree(root, 80, // x - starting point od the tree
            1, // starting depth
            getContainer());
        }
        Canvas.drawTree = drawTree;
    })(Canvas = FamilyTreePrinter.Canvas || (FamilyTreePrinter.Canvas = {}));
})(FamilyTreePrinter || (FamilyTreePrinter = {}));
/**
 * FamilyTreePrinter - node
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/FamilyTreePrinter/
 */
var FamilyTreePrinter;
/**
 * FamilyTreePrinter - node
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/FamilyTreePrinter/
 */
(function (FamilyTreePrinter) {
    /**
     * Class representing single node in the tree
     */
    class Node {
        /**
         * Initializes class
         * @param data - person data
         */
        constructor(data) {
            this.data = data;
            // static appearance properties of node
            this.props = {
                width: 40,
                height: 40,
                rounded: 10,
                space: {
                    sibling: 10,
                    generation: 20
                },
                color: {
                    "f": {
                        background: "rgb(245, 184, 219)",
                        stroke: "rgb(214, 161, 191)"
                    },
                    "m": {
                        background: "rgb(159, 213, 235)",
                        stroke: "rgb(142, 191, 211)"
                    }
                }
            };
            // current node final/calculated coordinates
            this.coords = { x: 0, y: 0 };
            // children of current node
            this.children = [];
            this.id = data.id;
        }
        /**
         * Gets first child (throws when no children)
         */
        firstChild() {
            if (this.children.length == 0) {
                throw new Error("Node doesn't have children");
            }
            return this.children[0];
        }
        /**
         * Gets last child (throws when no children)
         */
        lastChild() {
            if (this.children.length == 0) {
                throw new Error("Node doesn't have children");
            }
            return this.children[this.children.length - 1];
        }
        /**
         * Returns minimal x value where next node on the same level can be drawn
         */
        maxContainerX() {
            // set default to end of the single box
            let maxx = this.coords.x + this.props.width;
            if (this.children.length > 1) {
                let mostRightDescendant = this.lastChild();
                while (mostRightDescendant.children.length) {
                    mostRightDescendant = mostRightDescendant.lastChild();
                }
                maxx = mostRightDescendant.coords.x + this.props.width;
            }
            return maxx + this.props.space.sibling;
        }
        /**
         * Draws node on given container
         * @param container - container where node should be drawn
         * @param x - default x value (won't be used when more than 1 child)
         * @param depth - "level" number starting from root
         */
        print(container, x, depth) {
            this.setCoords(x, depth);
            // since we want to render some elements in the node we create group to position them easier
            const boxGroup = container
                .append("g")
                .attr("transform", `translate(${this.coords.x},${this.coords.y})`);
            boxGroup.append("rect")
                .attrs({ x: 0, y: 0, width: this.props.width, height: this.props.height, fill: this.getBgColor() })
                .attr("rx", this.props.rounded)
                .attr("ry", this.props.rounded)
                .attr("stroke-width", 1.5)
                .attr("stroke", this.getStrokeColor());
            boxGroup.append("text")
                .attrs({
                x: Math.floor(this.props.width / 2),
                y: Math.floor(this.props.height / 2) + 2,
                "alignment-baseline": "middle",
                "text-anchor": "middle",
                textLength: this.props.width,
                style: "font-size: 24px; font-weight: bold; font-family: SANS-SERIF",
                fill: "rgb(77, 148, 177)"
            })
                .text(this.data.name);
            // draw connection line with children - since all of them should be rendered at this point
            this.connectChildren(container);
            return this.maxContainerX();
        }
        /**
         * Returns coordinates of center top point of the node
         */
        getMiddleTop() {
            return {
                x: this.coords.x + Math.floor(this.props.width / 2),
                y: this.coords.y,
                isRelative: false
            };
        }
        /**
         * Returns coordinates of center bottom point of the node
         */
        getMiddleBottom() {
            return {
                x: this.coords.x + Math.floor(this.props.width / 2),
                y: this.coords.y + this.props.height,
                isRelative: false
            };
        }
        /**
         * Sets final node coordinations
         *
         * This function must not be called before all children were drawn
         *
         * @param x - default x value (won't be used when more than 1 child)
         * @param depth - "level" number starting from root
         */
        setCoords(x, depth) {
            if (this.children.length < 2) {
                this.coords.x = x;
            }
            else {
                this.coords.x = Math.floor((this.firstChild().coords.x + this.lastChild().coords.x) / 2);
            }
            this.coords.y = depth * (this.props.height + this.props.space.generation);
        }
        /**
         * Draws connection lines between current node and its children
         * @param container - container where path should be added
         */
        connectChildren(container) {
            // if there is no children quit
            if (!this.children.length) {
                return;
            }
            // middle position between generations - depths
            let halfGenSpace = Math.floor(this.props.space.generation / 2);
            let path;
            if (this.children.length == 1) {
                // if there is only one child we just have to connecti it with streight line to the parent right above
                path = new FamilyTreePrinter.Path(this.firstChild().getMiddleTop()).lineTo(0, -1 * this.props.space.generation);
            }
            else {
                // connecting first child with the last one
                path = new FamilyTreePrinter.Path(this.firstChild().getMiddleTop())
                    .arcTo(halfGenSpace, -1 * halfGenSpace)
                    .lineTo(this.lastChild().getMiddleTop().x - halfGenSpace, null, false)
                    .arcTo(this.lastChild().getMiddleTop());
                // connectiong rest of children to the previously drawn line
                if (this.children.length > 2) {
                    for (let i = 1; i < this.children.length - 1; i++) {
                        path.moveTo(this.children[i].getMiddleTop()).lineTo(null, -1 * halfGenSpace);
                    }
                }
                // connect current node to the line
                path.moveTo(this.getMiddleBottom()).lineTo(0, halfGenSpace);
            }
            // render connection line
            container.append("path")
                .attr("d", path.getPath())
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("stroke-opacity", 0.3)
                .attr("fill", "none");
        }
    }
    FamilyTreePrinter.Node = Node;
    class ExtendedNode extends Node {
        getBgColor() {
            return this.props.color[this.data.sex].background;
        }
        getStrokeColor() {
            return this.props.color[this.data.sex].stroke;
        }
        getChildren(spouse) {
            return this.children.filter(child => spouse.children.some(ch => ch.id == child.id));
        }
    }
    class PersonNode extends ExtendedNode {
        constructor() {
            super(...arguments);
            this.spouses = [];
        }
    }
    FamilyTreePrinter.PersonNode = PersonNode;
    class SpouseNode extends ExtendedNode {
    }
    FamilyTreePrinter.SpouseNode = SpouseNode;
})(FamilyTreePrinter || (FamilyTreePrinter = {}));
/**
 * FamilyTreePrinter - path
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/FamilyTreePrinter/
 */
var FamilyTreePrinter;
/**
 * FamilyTreePrinter - path
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/FamilyTreePrinter/
 */
(function (FamilyTreePrinter) {
    /**
     * Class for generating paths
     */
    class Path {
        constructor(x, y) {
            this.path = "";
            this.currentPos = {
                x: 0,
                y: 0
            };
            this.markers = {};
            if (this.isCoordsObject(x)) {
                this.moveTo(x);
            }
            else {
                this.moveTo(x, y, false);
            }
        }
        lineTo(x, y, isRelative = true) {
            this.setCurrentPos(x, y, isRelative);
            this.path += `L ${this.currentPos.x} ${this.currentPos.y}`;
            return this;
        }
        arcTo(x, y, rx, ry, isRelative = true) {
            let oldPos = Object.assign({}, this.currentPos);
            this.setCurrentPos(x, y, isRelative);
            if (rx === undefined) {
                rx = Math.abs(oldPos.x - this.currentPos.x);
            }
            if (ry === undefined) {
                ry = Math.abs(oldPos.y - this.currentPos.y);
            }
            this.path += `A ${rx} ${ry} 0 0 1 ${this.currentPos.x} ${this.currentPos.y}`;
            return this;
        }
        moveTo(x, y, isRelative = true) {
            this.setCurrentPos(x, y, isRelative);
            this.path += `M ${this.currentPos.x} ${this.currentPos.y}`;
            return this;
        }
        /**
         * Sets marker with gived id
         *
         * You can mark current point if you'd like to start drawing from it later
         *
         * @param id - id of the marker
         */
        setMarker(id) {
            this.markers[id] = Object.assign({}, this.currentPos);
            return this;
        }
        /**
         * Moves current point to given (saved earlier) marker
         * @param id - id of the marker
         */
        moveToMarker(id) {
            return this.moveTo(this.markers[id].x, this.markers[id].y, false);
        }
        /**
         * Returns path data
         */
        getPath() {
            return this.path;
        }
        /**
         * Checks whether given variable is ICoords
         * @param obj - object to test
         */
        isCoordsObject(obj) {
            return typeof obj === "object" && obj !== null && obj.x !== undefined && obj.y !== undefined;
        }
        /**
         * Sets current position based on given data (resolves relative values)
         * @param x - target x or ICoords object
         * @param y - target y
         * @param isRelative - whether x & y are relative (not absolute values)
         */
        setCurrentPos(x, y, isRelative) {
            if (this.isCoordsObject(x)) {
                let coords = x;
                x = coords.x;
                y = coords.y;
                isRelative = coords.isRelative;
            }
            if (x == null) {
                x = isRelative ? 0 : this.currentPos.x;
            }
            if (y == null) {
                y = isRelative ? 0 : this.currentPos.y;
            }
            if (isRelative) {
                this.currentPos.x += x;
                this.currentPos.y += y;
            }
            else {
                this.currentPos.x = x;
                this.currentPos.y = y;
            }
        }
    }
    FamilyTreePrinter.Path = Path;
})(FamilyTreePrinter || (FamilyTreePrinter = {}));
var FamilyTreePrinter;
(function (FamilyTreePrinter) {
    class DataProcessor {
        process(nodes, spouses) {
            // create main tree nodes (PersonNodes)
            this.idToPersonMap = nodes.reduce((idToNodeMap, nodeData) => this.processPerson(idToNodeMap, nodeData), {});
            spouses.forEach(spouseData => {
                let spouse = new FamilyTreePrinter.SpouseNode(spouseData);
                // add children
                spouseData.children && spouseData.children.forEach(childId => spouse.children.push(this.idToPersonMap[childId]));
                // add spouse to person node
                this.idToPersonMap[spouseData.partner].spouses.push(new FamilyTreePrinter.SpouseNode(spouseData));
            });
            return this;
        }
        processPerson(idToNodeMap, nodeData) {
            let childrenToAddLater = {};
            return (() => {
                idToNodeMap[nodeData.id] = new FamilyTreePrinter.PersonNode(nodeData);
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
            })();
        }
    }
    FamilyTreePrinter.DataProcessor = DataProcessor;
})(FamilyTreePrinter || (FamilyTreePrinter = {}));
