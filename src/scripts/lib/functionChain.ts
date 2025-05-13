
export interface fnCall{
    fn: Function,
}
type indexedFnCall = {
    index: number,
    fn: Function,
}
export class functionChain<T extends fnCall>{
    private chain: Array<indexedFnCall> = [];
    private index: number = 0;
    constructor(){
        this.chain = [];
        this.index = 0;
    }
    
    public then(fn:Function):functionChain<T>{
        this.index++;
        this.chain.push({
            index: this.index,
            fn: fn,
        });
        return this;
    }
    public add(fn: T): functionChain<T>{
        this.index++;
        this.chain.push({
            index: this.index,
            fn: fn.fn,
        });
        return this;
    }
    public remove(index: number): functionChain<T>{
        this.chain = this.chain.filter((item) => item.index !== index);
        return this;
    }

    public clear(): functionChain<T>{
        this.chain = [];
        this.index = 0;
        return this;
    }

    public run(...args: any[]): void {
        for (const item of this.chain) {
            item.fn(...args);
        }
    }
}

//test
const chain = new functionChain<fnCall>();
chain.add({ fn: () => console.log("1") })
    .add({ fn: () => console.log("2") })
    .add({ fn: () => console.log("3") })
    .add({ fn: () => console.log("4") })
    .add({ fn: () => console.log("5") })
    .remove(3)
    .run();

chain.clear();

let str = {
    value : "test"
}
chain.add({ fn: (str: any) => str.value += "1" })
    .add({ fn: (str: any) => str.value += "2" })
    .add({ fn: (str: any) => str.value += "3" })
    .add({ fn: (str: any) => str.value += "4" })
    .add({ fn: (str: any) => str.value += "5" })
    .remove(3)
    .run(str);
console.log("str", str.value);