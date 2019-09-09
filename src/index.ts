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
        { id: 10, name: "Ca", sex: "m", parent: 3 },
    ];

    let spouses: ISpouseData[] = [
        { id: 1, name: "SA_2", sex: "f", partner: 1, since: "2015-10-01", children: [1] }, // current
        { id: 2, name: "SA_1", sex: "f", partner: 1, since: "2010-09-20", children: [2, 3], till: "2015-05-18" }, // ex
        { id: 3, name: "SD_1", sex: "f", partner: 4, since: "2015-05-20", children: [5, 6, 7] }, // current
        { id: 4, name: "SB_1", sex: "m", partner: 2, since: "2015-05-20", children: [8, 9] } // current
    ];

    spouses = [
        { id: 3, name: "SD_1", sex: "f", partner: 4, since: "2015-05-20", children: [5, 6, 7] }, // current
    ];

    window.addEventListener("load", () => {
        Canvas.drawTree(new DataProcessor().process(treeData, spouses).rootNode);
    });
}