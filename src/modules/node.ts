/**
 * FamilyTreePrinter - node
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/FamilyTreePrinter/
 */
module FamilyTreePrinter {
    /**
     * Class representing single node in the tree
     */
    export abstract class Node {
        // static appearance properties of node
        protected props = {
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
        }

        // current node final/calculated coordinates
        public coords: ICoords = { x: 0, y: 0 };

        public id: number;

        // children of current node
        public children: Node[] = [];

        /**
         * Initializes class
         * @param data - person data
         */
        constructor(protected data: IPersonData) {
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
        maxContainerX(): number {
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
        print(container: any, x: number, depth: number): number {

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
        getMiddleTop(): ICoords {
            return {
                x: this.coords.x + Math.floor(this.props.width / 2),
                y: this.coords.y,
                isRelative: false
            }
        }

        /**
         * Returns coordinates of center bottom point of the node
         */
        getMiddleBottom(): ICoords {
            return {
                x: this.coords.x + Math.floor(this.props.width / 2),
                y: this.coords.y + this.props.height,
                isRelative: false
            }
        }

        protected abstract getBgColor(): string;

        protected abstract getStrokeColor(): string;

        /**
         * Sets final node coordinations
         *
         * This function must not be called before all children were drawn
         *
         * @param x - default x value (won't be used when more than 1 child)
         * @param depth - "level" number starting from root
         */
        protected setCoords(x: number, depth: number) {
            if (this.children.length < 2) {
                this.coords.x = x;
            }
            else {
                this.coords.x = Math.floor((this.firstChild().coords.x + this.lastChild().coords.x) / 2)
            }

            this.coords.y = depth * (this.props.height + this.props.space.generation);
        }

        /**
         * Draws connection lines between current node and its children
         * @param container - container where path should be added
         */
        protected connectChildren(container: d3.Selection<"g">) {
            // if there is no children quit
            if (!this.children.length) {
                return;
            }

            // middle position between generations - depths
            let halfGenSpace = Math.floor(this.props.space.generation / 2);

            let path: Path;
            if (this.children.length == 1) {
                // if there is only one child we just have to connecti it with streight line to the parent right above
                path = new Path(this.firstChild().getMiddleTop()).lineTo(0, -1 * this.props.space.generation);
            }
            else {
                // connecting first child with the last one
                path = new Path(this.firstChild().getMiddleTop())
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

    class ExtendedNode extends Node {

        protected getBgColor() {
            return this.props.color[this.data.sex].background;
        }

        protected getStrokeColor() {
            return this.props.color[this.data.sex].stroke;
        }
    }

    export class PersonNode extends ExtendedNode {

        public spouses: SpouseNode[] = [];

        public parent: PersonNode;

        getSpouses(): SpouseNode[] {
            // local cache to not sort twice
            let sortedSpouses: SpouseNode[];
            return (() => sortedSpouses ? sortedSpouses : sortedSpouses = this.spouses.sort((a, b) => a.compareWith(b)))();
        }

        getChildren(spouse?: SpouseNode): PersonNode[] {
            if (spouse) {
                return this.children.filter(child => spouse.isMyChild(child)) as PersonNode[];
            }

            // return kids who doesn't have second parent
            return this.children.filter(child =>
                !this.spouses.some(spouse => spouse.isMyChild(child))
            ) as PersonNode[];
        }

        /**
         * Sets final node coordinations (override)
         *
         * This function must not be called before all children were drawn
         *
         * @param x - default x value (won't be used when more than 1 child)
         * @param depth - "level" number starting from root
         */
        protected setCoords(x: number, depth: number) {

            super.setCoords(x, depth);

            if (this.spouses.length == 0) {
                // print me in the middle of children
                return;
            }

            const secondParent = this.getSecondParent();

            if (this.children.length < 2) {
                this.coords.x = x;
            }
            else {
                this.coords.x = Math.floor((this.firstChild().coords.x + this.lastChild().coords.x) / 2)
            }

            this.coords.y = depth * (this.props.height + this.props.space.generation);
        }

        protected getLastSpouse() {
            return this.spouses[this.spouses.length - 1];
        }

        private getSecondParent(): SpouseNode  {
            if (!this.parent) {
                return null;
            }

            return this.parent.spouses.find(spouse => spouse.isMyChild(this));
        }

        public maxContainerX(): number {
            if (this.spouses.length > 0 && this.getLastSpouse().children.length < 2) {
                // take spouse border
                return this.getLastSpouse().maxContainerX();
            }

            return super.maxContainerX();
        }
    }

    export class SpouseNode extends ExtendedNode {

        protected data: ISpouseData;

        public partner: PersonNode;

        constructor(data: ISpouseData) {
            super(data);
        }

        /**
         * Logic comparing spouses for sorting
         */
        compareWith(b: SpouseNode): number {
            // logic deciding which spouse is the current one (last one)

            if (this.data.till) {
                // compare relationship end dates if both existe
                // if the other one doesn't exist it means it should be after current node
                return b.data.till ? this.data.till.localeCompare(b.data.till) : -1;
            }

            // if current one doesn't have relationship end date but the other one does
            // it means the other one should be before current node
            if (b.data.till) {
                return 1;
            }

            // dummy assumption that last entered partner is the current one
            // the alternative would be to make them equal (0)
            return this.id - b.id;
        }

        /**
         * Checks if given child belongs to this spouse
         * @param child - Child to test
         */
        isMyChild(child: Node) {
            return this.data.children.indexOf(child.id) != -1;
        }

        /**
         * Checks if given person is current parter or ex
         * @param person
         */
        isLastPartner(person: PersonNode) {
            let spouses = person.getSpouses();
            // current one should be the last on the list
            return spouses[spouses.length - 1].id == this.id;
        }

        protected setCoords(x: number, depth: number) {
            super.setCoords(x, depth);

            if (this.isLastPartner(this.partner)) {
                this.coords.x = this.partner.coords.x + this.props.width + this.props.space.sibling;
            }
            else {
                // print on the left side of partner node
            }
        }

        protected connectChildren(container: d3.Selection<"g">) {
            // TODO

            // if not current parter then connect directly underneath
        }
    }
}