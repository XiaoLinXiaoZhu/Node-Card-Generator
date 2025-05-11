// 一个自定义的拓展了我认为好用的GraphNode
import { LGraphNode, LLink, LiteGraph, type INodeInputSlot, type INodeOutputSlot, type IWidget } from "litegraph.js";

export class ExLGraphNode extends LGraphNode {
    addBindedWidget<T extends IWidget>(
        type: T["type"],
        name: string,
        value: T["value"],
        /**
         * * 如果 callback 返回 false，则还原widget的值
         */
        callback: (value: T["value"]) => boolean | void,
        options?: T["options"]
    ): T {
        // options 添加一个 property:name
        options = options || {};
        options.property = name;




        const widget = this.addWidget(type, name, value, "", options);
        // callback 需要combine 一个默认的绑定
        // 现在 widget 的变化能够 同步到 property 上
        // const combinedCallback = (value: T["value"]) => {
        //     // 如果 callback 返回 false，则还原widget的值
        //     const result = callback(value);
        //     //debug
        //     console.log("123123callback", widget.callback, value, result);
        //     if (result === false) {
        //         // 还原 widget 的值
        //         // debug
        //         console.log("还原 widget 的值", name, value, this.properties[name]);
        //         widget.value = this.properties[name];
        //     } 
        //     // 如果没有返回值，则将 widget 的值 同步到 property 上
        //     else if (value !== this.properties[name]) {
        //         this.setProperty(name, value);
        //     }
        // };
        // widget.callback = combinedCallback;

        // 将 property 的变化也同步到 widget 上
        this.propertyChangeCallbacks[name] = (value: any, prevValue: any) => {
            // if (value !== prevValue) {
            //     widget.value = value;
            // }
            // 因为这里 LGraph 已经将 property 的值 和 widget 的值进行了绑定，所以说不再需要在widget上进行更新，而是在这里
            // 因为这里能够拿到 prevValue
            const result = callback(value);
            // 如果result 等于 false 或者 value 和 prevValue 相同，则返回false不要求 property 进行更新
            if (result === false || value === prevValue) {
                // 还原 widget 的值
                // debug
                setTimeout(() => {
                    console.log("还原 widget 的值", name, value, this.properties[name]);
                    widget.value = this.properties[name];
                }, 0);
                return false;
            }

        };

        return widget as T;
    }

    propertyChangeCallbacks: Record<string, (value: any, prevValue: any) => void | boolean> = {};
    // 重写 onPropertyChanged 方法
    onPropertyChanged(property: string, value: any, prevValue: any): void | boolean {
        // 如果有对应的回调函数，则执行
        // debug
        console.log("onPropertyChanged", property, value, prevValue);
        if (this.propertyChangeCallbacks[property]) {
            //debug
            console.log("callback", property, value, prevValue, this.propertyChangeCallbacks[property]);
            const result = this.propertyChangeCallbacks[property](value, prevValue);
            if (result === false) {
                return false;
            }
        }
        // 调用父类的方法
        if (super.onPropertyChanged) {
            return super.onPropertyChanged(property, value, prevValue);
        }
        return true;
    }

    // 重写 onConnectionsChange(type: number, slotIndex: number, isConnected: boolean, link: LLink, ioSlot: (INodeOutputSlot | INodeInputSlot)): void
    // 原本的方法太难绷了，它不仅将 输入和输出和端口全部混到一起了，而且还要判断是断开还是连接
    connectionChangeCallbacks: Record<string, IConnectCallback[]> = {};

    addConnectionChangeCallback(slotIndex: number, type: ConnectionType, isConnected: boolean, callback: (value: IConnectProperties) => void): void {
        if (!this.connectionChangeCallbacks[slotIndex]) {
            this.connectionChangeCallbacks[slotIndex] = [];
        }
        this.connectionChangeCallbacks[slotIndex].push({
            type: type,
            slotIndex: slotIndex,
            isConnected: isConnected,
            callback: callback
        });
    }
    onInputDisconnected(slotIndex: number, callback: (value: IConnectProperties) => void): void {
        this.addConnectionChangeCallback(slotIndex, ConnectionType.INPUT, false, callback);
    }
    onInputConnected(slotIndex: number, callback: (value: IConnectProperties) => void): void {
        this.addConnectionChangeCallback(slotIndex, ConnectionType.INPUT, true, callback);
    }
    onOutputDisconnected(slotIndex: number, callback: (value: IConnectProperties) => void): void {
        this.addConnectionChangeCallback(slotIndex, ConnectionType.OUTPUT, false, callback);
    }
    onOutputConnected(slotIndex: number, callback: (value: IConnectProperties) => void): void {
        this.addConnectionChangeCallback(slotIndex, ConnectionType.OUTPUT, true, callback);
    }

    onConnectionsChange(type: number, slotIndex: number, isConnected: boolean, link: LLink, ioSlot: (INodeOutputSlot | INodeInputSlot)): void {
        // match the type to the connectionChangeCallbacks
        const callback = this.connectionChangeCallbacks[slotIndex];
        if (callback) {
            callback.forEach((item) => {
                if (item.type === type && item.slotIndex === slotIndex && item.isConnected === isConnected) {
                    if (!link || !ioSlot) {
                        console.warn("link or ioSlot is null,but invoked callback", link, ioSlot);
                        return;
                    }
                    item.callback({
                        link: link,
                        ioSlot: ioSlot
                    });
                }
            });
        }
    }
}

export enum ConnectionType {
    INPUT = LiteGraph.INPUT,
    OUTPUT = LiteGraph.OUTPUT,
}

export type IConnectProperties = {
    link: LLink | null;
    ioSlot: (INodeOutputSlot | INodeInputSlot) | null;
}

export type IConnectCallback = {
    type: ConnectionType;
    slotIndex: number;
    isConnected: boolean;
    callback: (value: IConnectProperties) => void;
}