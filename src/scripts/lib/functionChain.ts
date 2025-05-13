
export interface FnCall{
    fn: Function,
}
type indexedFnCall = {
    index: number,
    fn: Function,
}
export class FunctionChain<T extends FnCall>{
    private chain: Array<indexedFnCall> = [];
    private index: number = 0;
    constructor(){
        this.chain = [];
        this.index = 0;
    }
    
    public then(fn:Function):FunctionChain<T>{
        this.index++;
        this.chain.push({
            index: this.index,
            fn: fn,
        });
        return this;
    }
    public add(fn: T): FunctionChain<T>{
        this.index++;
        this.chain.push({
            index: this.index,
            fn: fn.fn,
        });
        return this;
    }
    public remove(index: number): FunctionChain<T>{
        this.chain = this.chain.filter((item) => item.index !== index);
        return this;
    }

    public clear(): FunctionChain<T>{
        this.chain = [];
        this.index = 0;
        return this;
    }

    public async run(...args: any[]): Promise<void> {
        for (const item of this.chain) {
            await item.fn(...args);
        }
    }

    public async debugRun(...args: any[]): Promise<void> {
        for (const item of this.chain) {
            console.log("running", item.index);
            await item.fn(...args);
            console.log("done", item.index, args);
        }
    }
}

//test
// const chain = new FunctionChain<FnCall>();
// chain.add({ fn: () => console.log("1") })
//     .add({ fn: () => console.log("2") })
//     .add({ fn: () => console.log("3") })
//     .add({ fn: () => console.log("4") })
//     .add({ fn: () => console.log("5") })
//     .remove(3)
//     .run().then(() => {
//         console.log("done");
//     });

// const chain2 = new FunctionChain<FnCall>();


// let str = {
//     value : "test"
// }
// chain2.add({ fn: (str: any) => str.value += "1" })
//     .add({ fn: (str: any) => str.value += "2" })
//     .add({ fn: (str: any) => str.value += "3" })
//     .add({ fn: (str: any) => str.value += "4" })
//     .add({ fn: (str: any) => str.value += "5" })
//     .remove(3)
//     .run(str).then(() => {
//         console.log(str.value); // test12345
//     })
