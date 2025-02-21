import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
import { CocktailCup } from '../Component/CocktailCup';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('OutArea')
@executeInEditMode
export class OutArea extends Component {

    @property(Node)
    outNodes: Node = null!;

    // 直接使用outNodes的子节点管理
    get cups() {
        return this.outNodes.children;
    }

    start() {
        this.registerEvent();
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_FILL_UP, this.onFillUp, this);
    }

    private registerEvent(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_FILL_UP, this.onFillUp, this);
    }

    private async onFillUp(): Promise<void> {
        console.log('补满');

        // 获取所有有效杯子
        const validCups = this.cups.filter(cup => cup.isValid);
        if (validCups.length === 0) return;

        // 找到最右边的杯子（x坐标最大的）
        const rightMostCup = validCups.reduce((prev, current) => {
            return prev.position.x > current.position.x ? prev : current;
        });

        const cocktailCup = rightMostCup.getComponent(CocktailCup);
        if (cocktailCup) {
            try {
                // 执行补满动画并等待完成
                await cocktailCup.fillUp();
                console.log('最右侧杯子已补满');
            } catch (e) {
                console.error('补满操作失败:', e);
            }
        }
    }

    update(deltaTime: number) {

    }

    // 修改排列方法为异步
    async arrangeCups() {
        const startX = 40;
        const spacing = 80;

        // 过滤掉已销毁的节点
        const validCups = this.cups.filter(cup => cup.isValid);

        await new Promise<void>(resolve => {
            let completed = 0;
            validCups.forEach((cup, index) => {
                const targetX = startX + index * spacing;
                tween(cup)
                    .to(0.3, { position: new Vec3(targetX, 0, 0) }, { easing: 'sineOut' })
                    .call(() => {
                        if (++completed === validCups.length) resolve();
                    })
                    .start();
            });

            // 处理无动画的情况
            if (validCups.length === 0) resolve();
        });
    }

    addCup(cup: Node) {
        cup.setParent(this.outNodes);
        this.arrangeCups();
    }

    removeCup(cup: Node) {
        cup.removeFromParent();
        this.arrangeCups();
    }

    getCups() {
        return this.cups;
    }
}


