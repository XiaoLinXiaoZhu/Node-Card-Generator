// 一个支持记录和渲染 树状结构 的类
// 树状结构用于记录 操作 和 数据
// 支持以下操作：
// new Tree().add(Element1).add(Element2).add(Element3).addEffect(Effect1).addEffect(Effect2)
// new Tree().add(Element1).addEffect(Effect1).add(Element2).addEffect(Effect2)
// 支持更为复杂的嵌套操作：
// new Tree().add(Element1).add((new Tree().add(Element2).addEffect(Effect2))).addEffect(Effect1)
// 在这种复杂的嵌套下，它 effect2 只会作用于 Element2，而不会作用于 Element1
// 支持基于id的查找：
// tree.find(id)
// 支持基于id的删除，删除后，树将会自动，将删除的节点的子节点添加到父节点上
// tree.remove(id)
// 支持基于id的替换
// tree.replace(id, newElement)

// 这是一个通用的树状结构类，支持任意类型的节点

// 如果想要让
export interface TreeNode<T> {
    id: string;
    data: T | null;
    children: TreeNode<T>[];
    parent: TreeNode<T> | null;
}

export class Tree<T> {
    public root: TreeNode<T>;
    public nodes: Map<string, TreeNode<T>>;

    constructor() {
        this.root = {
            id: this.generateId(),
            data: null,
            children: [],
            parent: null
        };
        this.nodes = new Map<string, TreeNode<T>>();
        this.nodes.set(this.root.id, this.root);
    }
    static createNode<T>(data: T): TreeNode<T> {
        return {
            id: Math.random().toString(36).substr(2, 9),
            data: data,
            children: [],
            parent: null
        };
    }
    static setParent<T>(node: TreeNode<T>, parent: TreeNode<T> | null): TreeNode<T> {
        node.parent = parent;
        if (parent) {
            parent.children.push(node);
        }
        return node;
    }

    addRootNode(data: T): Tree<T> {
        // 从顶部添加节点
        // 如果根节点没有数据，则将数据添加到根节点
        if (this.root.data === null) {
            this.root.data = data;
            return this;
        }
        // 否则，创建一个新的节点，并将其作为新的根节点
        const node = Tree.createNode(data);
        this.nodes.set(node.id, node);
        const oldRoot = this.root;
        this.root = node;
        node.children.push(oldRoot);
        oldRoot.parent = node;

        return this;
    }

    getNodes(): TreeNode<T>[] {
        return Array.from(this.nodes.values());
    }
    find(id: string): TreeNode<T> | null {
        return this.nodes.get(id) || null;
    }
    remove(id: string): Tree<T> {
        const node = this.find(id);
        if (!node) return this;
        if (node.parent) {
            node.parent.children = node.parent.children.filter(child => child.id !== id);
            node.children.forEach(child => {
                child.parent = node.parent;
                if (node.parent) {
                    node.parent.children.push(child);
                }
            });
        }
        this.nodes.delete(id);
        return this;
    }
    replace(id: string, data: T): Tree<T> {
        const node = this.find(id);
        if (!node) return this;
        node.data = data;
        return this;
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    printTree(): void {
        const printNode = (node: TreeNode<T>, prefix: string, isLast: boolean): void => {
            console.log(`${prefix}${isLast ? '└── ' : '├── '}${node.data ? JSON.stringify(node.data) : 'null'}`);
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            node.children.forEach((child, index) => {
                printNode(child, newPrefix, index === node.children.length - 1);
            });
        };
        printNode(this.root, '', true);
    }
}
