import { LGraphNode, LiteGraph, LLink, type INodeInputSlot, type INodeOutputSlot, type IWidget, type SerializedLGraphNode } from "litegraph.js";

// 规则类型定义
interface FormatRule {
    type: string;
    pattern: string;
    style: {
        color?: string;
        backgroundColor?: string;
        fontWeight?: string;
        icon?: string;
        borderRadius?: string;
        padding?: string;
        margin?: string;
        fontSize?: string;
        textAlign?: string;
        display?: string;
        width?: string;
        height?: string;
        verticalAlign?: string;
    };
    priority: number;
}

class TextFormatter extends LGraphNode {
    static title = "Text Formatter";
    static desc = "Format text with rules";
    static pixels_threshold = 10;
    static markers_color = "#666";

    properties = {
        rules: [
            {
                type: "title",
                pattern: ".*?：",
                style: {
                    color: "#1a237e",
                    fontWeight: "bold",
                    fontSize: "18px"
                },
                priority: 1
            },
            {
                type: "skill",
                pattern: "\\[锁定技\\]|\\[主动技\\]",
                style: {
                    icon: "path/to/lock-icon.png",
                    verticalAlign: "middle"
                },
                priority: 2
            },
            {
                type: "emphasis",
                pattern: "一回合一次",
                style: {
                    backgroundColor: "#1a237e",
                    color: "white",
                    padding: "2px 4px",
                    borderRadius: "4px"
                },
                priority: 3
            },
            {
                type: "special",
                pattern: "抽一张牌",
                style: {
                    fontWeight: "bold",
                    icon: "path/to/draw-icon.png",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                },
                priority: 4
            }
        ] as FormatRule[],
        nodeWidth: 400 // 添加节点宽度属性
    };

    widgets: IWidget[] = []; // 添加 widgets 属性

    constructor() {
        super(TextFormatter.title);
        this.addInput("原始文本", "string");
        this.addOutput("格式化文本", "string");

        // 保存当前节点宽度
        this.properties.nodeWidth = this.size[0];

        // 添加规则管理按钮
        this.addWidget("button", "添加规则", null, () => {
            // 保存当前宽度
            const currentWidth = this.size[0];
            
            this.properties.rules.push({
                type: "default",
                pattern: "",
                style: {
                    color: "",
                    backgroundColor: "",
                    fontWeight: "",
                    icon: "",
                    borderRadius: "",
                    padding: "",
                    margin: "",
                    fontSize: "",
                    textAlign: "",
                    display: "",
                    width: "",
                    height: "",
                    verticalAlign: ""
                },
                priority: this.properties.rules.length + 1
            });
            this.updateRuleWidgets();
            
            // 恢复宽度
            this.size[0] = currentWidth;
        });

        // 初始化规则配置界面
        this.updateRuleWidgets();
    }

    onConfigure(o: SerializedLGraphNode): void {
        if (super.onConfigure) {
            super.onConfigure(o);
        }
        // 恢复保存的规则
        if (o.properties && o.properties.rules) {
            this.properties.rules = o.properties.rules;
        }
        // 恢复保存的宽度
        if (o.properties && o.properties.nodeWidth) {
            this.properties.nodeWidth = o.properties.nodeWidth;
        }
        // 重新初始化规则配置界面
        this.updateRuleWidgets();
        // 恢复宽度
        this.size[0] = this.properties.nodeWidth;
    }

    updateRuleWidgets(): void {
        // 保存当前宽度
        const currentWidth = this.size[0];

        // 清除现有的规则配置界面
        this.widgets = this.widgets.filter((w: IWidget) => w.name === "添加规则");

        // 为每个规则创建配置界面
        this.properties.rules.forEach((rule, index) => {
            // 规则类型
            // this.addWidget("text", `rule_${index}_type`, rule.type, (v: string) => {
            //     rule.type = v;
            //     this.formatText();
            // });
            this.addWidget("combo", `rule_${index}_type`, rule.type, (v: string) => {
                rule.type = v;
                this.formatText();
            },{
                values:["title","skill","emphasis","special"]
            });

            // 匹配模式
            this.addWidget("text", `rule_${index}_pattern`, rule.pattern, (v: string) => {
                rule.pattern = v;
                this.formatText();
            });

            // 样式配置
            Object.entries(rule.style).forEach(([key, value]) => {
                this.addWidget("text", `rule_${index}_style_${key}`, `${key}:${value}`, (v: string) => {
                    const [newKey, newValue] = v.split(":").map(s => s.trim());
                    if (newKey && newValue) {
                        (rule.style as Record<string, string>)[newKey] = newValue;
                        this.formatText();
                    }
                });
            });

            // 优先级
            this.addWidget("number", `rule_${index}_priority`, rule.priority, (v: number) => {
                rule.priority = v;
                this.properties.rules.sort((a, b) => a.priority - b.priority);
                this.formatText();
            });

            // 删除规则按钮
            this.addWidget("button", `删除规则_${index}`, null, () => {
                this.properties.rules.splice(index, 1);
                this.updateRuleWidgets();
                this.formatText();
            });
        });

        // 恢复宽度
        this.size[0] = currentWidth;
        // 更新保存的宽度
        this.properties.nodeWidth = currentWidth;
    }

    formatText(): void {
        const text = this.getInputData(0);
        if (!text) {
            this.setOutputData(0, "");
            return;
        }

        // 按优先级排序规则
        const sortedRules = [...this.properties.rules].sort((a, b) => a.priority - b.priority);
        let formattedText = text;

        // 应用规则
        sortedRules.forEach(rule => {
            if (!rule.pattern) return; // 如果没有模式，则跳过
            const regex = new RegExp(rule.pattern, "g");
            formattedText = formattedText.replace(regex, (match: string) => {
                // 构建内联样式
                const styleStr = Object.entries(rule.style)
                    .filter(([key, value]) => key !== "icon" && value)
                    .map(([key, value]) => `${this.camelToKebab(key)}:${value}`)
                    .join(";");

                // 处理不同类型的规则
                switch (rule.type) {
                    case "title":
                        return `<span style="${styleStr}">${match}</span><br>`;
                    case "skill":
                        return rule.style.icon 
                            ? `<img src="${rule.style.icon}" alt="${match}" style="${styleStr}">`
                            : match;
                    case "emphasis":
                        return `<span style="${styleStr}">${match}</span>`;
                    case "special":
                        return rule.style.icon
                            ? `<span style="${styleStr}"><img src="${rule.style.icon}" alt="icon" style="width:16px;height:16px;vertical-align:middle;">${match}</span>`
                            : `<span style="${styleStr}">${match}</span>`;
                    default:
                        return `<span style="${styleStr}">${match}</span>`;
                }
            });
        });

        this.setOutputData(0, formattedText);
    }

    camelToKebab(str: string): string {
        return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    }

    onConnectionsChange(type: number, slotIndex: number, isConnected: boolean, link: LLink, ioSlot: (INodeInputSlot | INodeOutputSlot)): void {
        if (type === LiteGraph.INPUT && ioSlot.name === "原始文本") {
            if (isConnected) {
                const text = this.getInputData(0);
                if (text !== undefined) {
                    this.formatText();
                }
            } else {
                this.setOutputData(0, "");
            }
        }
    }

    onExecute(): void {
        this.formatText();
    }
}

// 注册节点类型
LiteGraph.registerNodeType("卡片制作/Text Formatter", TextFormatter);
