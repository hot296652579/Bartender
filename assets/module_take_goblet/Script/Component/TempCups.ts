import { _decorator, Component, Node, tween, UITransform, Vec3, view } from 'cc';
import { TempCup } from './TempCup';
import { GameEvent } from '../Enum/GameEvent';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
const { ccclass, property } = _decorator;

@ccclass('TempCups')
export class TempCups extends Component {
    start() {
        this.registerEvent();
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_MOVE_OUT, this.onMoveOut, this);
    }

    private registerEvent(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_MOVE_OUT, this.onMoveOut, this);
    }

    private async onMoveOut(): Promise<void> {
        console.log('执行移出操作');

        // 获取前三个子节点(最左侧的三个杯子)
        const cupsToProcess = this.node.children.slice(0, 3)
            .map(node => node.getComponent(TempCup))
            .filter(cup => cup && cup.isFull);

        if (cupsToProcess.length === 0) {
            console.log('没有可处理的暂存杯');
            return;
        }

        // 并行执行所有动画
        const tasks = cupsToProcess.map(cup => {
            return new Promise<void>((resolve) => {
                // 保存原始位置
                const originalPos = cup.node.position.clone();
                const screenWidth = view.getVisibleSize().width;
                const targetX = -screenWidth / 2 - cup.node.getComponent(UITransform)!.width * 1.5;
                const targetY = cup.node.position.y + Math.random() * 100;
                // 创建移动动画
                tween(cup.node)
                    .to(0.5, { position: new Vec3(targetX, targetY, 0) }, { easing: 'sineOut' })
                    .call(() => {
                        cup.node.position = originalPos; // 将位置重置到动画前保存的原始位置
                        cup.reset(); // 重置水杯状态
                        resolve();
                    })
                    .start();
            });
        });

        await Promise.all(tasks);
        console.log('所有暂存杯处理完成');
    }

    /** 查找暂存区空杯*/
    findAvailableTempCup(): TempCup | null {
        // 添加空值检查和类型过滤
        return this.node.children
            .map(node => node.getComponent(TempCup))
            .find(cup => cup && !cup.isFull && !cup.iconAd) || null;
    }

    // 新增获取已填充的暂存杯
    public getFilledCups(): TempCup[] {
        return this.node.children
            .map(node => node.getComponent(TempCup)!)
            .filter(cup => !cup.isEmpty());
    }
}


