import type { CardEffect, CardElement } from "./cardLibs";
import { Tree,type TreeNode } from "./tree";

type ElementTreeNodeData = CardElement | CardEffect | "ADD";

export class ElementTree extends Tree<ElementTreeNodeData> {
    constructor() {
        super();
    }

    addElement(data: ElementTreeNodeData): ElementTree {
        this.addRootNode("ADD");
        const node = ElementTree.createNode(data);
        ElementTree.setParent(node, this.root);
        return this;
    }

    addEffect(data: CardEffect): ElementTree {
        this.addRootNode(data);
        return this;
    }

    addTree(tree: ElementTree): ElementTree {
        this.addRootNode("ADD");
        const node = tree.root;
        ElementTree.setParent(node, this.root);
        return this;
    }
}

//test
const tree = new ElementTree();
const element1: CardElement = {
    uid: "1",
    type: "element",
    style: { theme: "default" },
};

const element2: CardElement = {
    uid: "2",
    type: "element",
    style: { theme: "default" },
};

const effect1: CardEffect = {
    uid: "3",
    name: "Effect 1",
    value: "blur",
};

const effect2: CardEffect = {
    uid: "4",
    name: "Effect 2",
    value: "brightness",
};


tree.addElement(element1)
tree.printTree();
tree.addElement(element2)
tree.printTree();
tree.addEffect(effect1)
tree.printTree();
tree.addEffect(effect2)
tree.printTree();


const tree2 = new ElementTree();
tree2.addElement(element1)
tree2.addEffect(effect1)
tree2.printTree();

tree.addTree(tree2)

tree.printTree();
