// 生成、管理 一个uid 系统

export class UidManager<T>{
    public uidMap: Map<string, T>; // 存储uid和对象的映射关系
    public uidCounter: number; // uid计数器
    public prefix: string; // uid前缀

    constructor(prefix: string = "uid_") {
        this.uidMap = new Map<string, T>(); // 初始化uidMap
        this.uidCounter = 0; // 初始化uid计数器
        this.prefix = prefix; // 设置uid前缀
    }

    add(obj: T): string {
        const uid = this.prefix + this.uidCounter++; // 生成新的uid
        this.uidMap.set(uid, obj); // 将uid和对象存储到uidMap中
        return uid; // 返回生成的uid
    }

    getObj(uid: string): T | undefined {
        return this.uidMap.get(uid); // 根据uid获取对象
    }

    getUid(obj: T): string {
        for (const [key, value] of this.uidMap.entries()) { // 遍历uidMap
            if (value === obj) { // 如果对象相等
                return key; // 返回对应的uid
            }
        }
        
        // 如果没有找到对应的uid，则 将其添加到uidMap中
        const uid = this.add(obj); // 生成新的uid
        return uid; // 返回生成的uid
    }

    has(uid: string): boolean {
        return this.uidMap.has(uid); // 检查uid是否存在
    }

    hasObj(obj: T): boolean {
        for (const [key, value] of this.uidMap.entries()) { // 遍历uidMap
            if (value === obj) { // 如果对象相等
                return true; // 返回true
            }
        }
        return false; // 返回false
    }

    remove(uid: string): boolean {
        return this.uidMap.delete(uid); // 删除uid和对象的映射关系
    }

    removeObj(obj: T): boolean {
        for (const [key, value] of this.uidMap.entries()) { // 遍历uidMap
            if (value === obj) { // 如果对象相等
                this.uidMap.delete(key); // 删除uid和对象的映射关系
                return true; // 返回true
            }
        }
        return false; // 返回false
    }

    clear(): void {
        this.uidMap.clear(); // 清空uidMap
        this.uidCounter = 0; // 重置uid计数器
    }
}