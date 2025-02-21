import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('WaitArea')
@executeInEditMode
export class WaitArea extends Component {

    @property(Node)
    waitNodes: Node = null!;  // 实际存放杯子的节点

    // 直接使用waitNodes的子节点管理
    get cups(): Node[] {
        // 反转数组实现从右到左排列（最右杯子在数组末尾）
        return this.waitNodes.children.slice().reverse();
    }

    start() {

    }

    update(deltaTime: number) {

    }

    // 从右向左排列
    arrangeCups() {
        const startX = -40;
        const spacing = -80;

        this.cups.forEach((cup, index) => {
            const originalIndex = this.waitNodes.children.indexOf(cup);
            cup.setPosition(startX + originalIndex * spacing, 0, 0);
        });

        // console.log('WaitArea 杯子数量: ', this.cups.length);
    }

    addCup(cup: Node) {
        cup.setParent(this.waitNodes);
        this.arrangeCups();
    }

    takeCup(): Node | null {
        if (this.cups.length === 0) return null;
        const cup = this.cups.pop()!;
        // 仅解除父节点关系，不立即销毁
        cup.parent = null;
        this.arrangeCups();
        return cup;
    }

    // 添加明确的返回类型
    getCups(): Node[] {
        return this.waitNodes.children;
    }
}


