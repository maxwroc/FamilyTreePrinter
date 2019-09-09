/**
 * FamilyTreePrinter - canvas
 *
 * @copyright Copyright 2019, Max Chodorowski
 * @license   MIT (https://opensource.org/licenses/MIT)
 * @link      https://maxwroc.github.io/FamilyTreePrinter/
 */
module FamilyTreePrinter.Canvas {

    let container: d3.Selection<"g">;

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
                let evt = d3.event as d3.ZoomEvent;
                container.attr("transform", "translate(" + evt.translate + ")scale(" + evt.scale + ")")
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
    function drawSubTree(node: Node, x: number, depth: number): number {
        const person = node as PersonNode;
        const spouses = person.getSpouses();

        let printMainNode = true;

        // draw common children for all spouses
        spouses.forEach((spouse, index) => {
            person.getChildren(spouse).forEach(child => {
                x = drawSubTree(child, x, depth + 1);
            });

            // we want to print person node first
            if (index == spouses.length - 1) {
                x = node.print(container, x, depth);
                printMainNode = false;
            }

            // set x based on spouse children container max x
            x = spouse.print(container, x, depth);
        });

        // draw kids without second parent
        person.getChildren().forEach(child => {
            x = drawSubTree(child, x, depth + 1);
        });

        /*
        for (const child of node.children) {
            x = drawSubTree(child, x, depth + 1);
        };
        */

        if (printMainNode) {
            x = node.print(container, x, depth);
        }

        return x;
    }

    export function drawTree(root: Node) {

        container = getContainer();

        drawSubTree(root, 80, 1);  // starting depth
    }
}