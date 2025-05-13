import { CardElementType, type CardEffect, type CardElement, type PixelEffect } from "../lib/cardLibs";
import { Tree,type TreeNode } from "./tree";

type ElementTreeNodeData = CardElement | CardEffect | PixelEffect | "ADD";

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
    printRenderArray(): string {
        // 通过遍历树的节点，生成一个字符串
        let result = "";
        // 使用深度优先遍历
        const traverse = (node: TreeNode<ElementTreeNodeData>, depth: number) => {
            
            if (node.data === "ADD") {
                // 如果是add节点，层级不添加且不打印
                depth--;
            }
            else{
                // result += "  ".repeat(depth) +node.id+":"+ node.data + "\n";
                result += "  ".repeat(depth) + `${node.id}:${'type' in (node.data || {}) ? "CardElement" : "CardEffect"}:${node.data || "null"}` + "\n";
            }
            for (const child of node.children) {
                traverse(child, depth + 1);
            }
        };
        traverse(this.root, 0);
        return result;
    }

    render(){
        //深度优先遍历，遍历到最底层，之后一层一层往上叠加处理
        const result: string[] = [];
        // 这里用string模拟处理效果
        let subElement: string = "";
        const traverse = (node: TreeNode<ElementTreeNodeData>, depth: number) => {
            // 如果是add节点，层级不添加且不打印
            if (node.data === "ADD") {
                depth--;
            }
            // 如果是CardEffect节点，则将CardEffect视为一个特殊的节点，将之前的subElement添加到当前节点
            if (node.data && typeof node.data !== "string" && "name" in node.data) {
                const str = "  ".repeat(depth) + `AddCardEffect:${node.id}:${node.data || "null"} to ${subElement}`;
                result.push(str);
                subElement+= str + "\n";
            }
            // 如果是PixelEffect节点，则将PixelEffect视为一个特殊的节点，将之前的subElement添加到当前节点
            if (node.data && typeof node.data !== "string" && "value" in node.data) {
                const str = "  ".repeat(depth) + `AddPixelEffect:${node.id}:${node.data || "null"} to ${subElement}`;
                result.push(str);
                subElement+= str + "\n";
            }
            // 如果是CardElement节点，则将CardElement视为一个特殊的节点，将之前的subElement添加到当前节点
            if (node.data && typeof node.data !== "string" && "type" in node.data) {
                const str = "  ".repeat(depth) + `Element:${node.id}:${node.data || "null"}`;
                result.push(str);
                subElement+= str + "\n";
            }

            if (node.children.length < 1) {
                subElement = "";
            }
            //debug
            console.log("subElement", subElement, "depth", depth);
            for (const child of node.children) {
                traverse(child, depth + 1);
            }
        };

        traverse(this.root, 0);
        return result.join("\n");
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
console.log(tree.render());
