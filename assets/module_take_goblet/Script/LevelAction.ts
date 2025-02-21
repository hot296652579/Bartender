import { _decorator, BoxCollider2D, Button, CircleCollider2D, Collider2D, Component, find, instantiate, Node, NodeEventType, tween, view, Vec3, mat4, UITransform } from 'cc';
import { CupHeight, TakeGobletGlobalInstance, WaterColorLog, WaterColors } from './TakeGobletGlobalInstance';
import { OutArea } from './Component/OutArea';
import { WaitArea } from './Component/WaitArea';
import { CocktailCup } from './Component/CocktailCup';
import { OriginCup } from './Component/OriginCup';
import { Water } from './Component/Water';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { TempCup } from './Component/TempCup';
import { TempCups } from './Component/TempCups';
import { tgxUIMgr, tgxUITips } from '../../core_tgx/tgx';
import { LevelManager } from './Manager/LevelMgr';
import { UI_BattleResult } from '../../scripts/UIDef';
import { OriginArea } from './Component/OriginArea';
const { ccclass, property } = _decorator;

@ccclass('LevelAction')
export class LevelAction extends Component {

    @property(OutArea)
    outArea: OutArea = null!;  // 直接引用OutArea组件

    @property(WaitArea)
    waitArea: WaitArea = null!;  // 直接引用WaitArea组件

    @property(Node)
    tempCups: Node = null!;  //临时杯

    @property(Node)
    originArea: Node = null!;  //原浆区

    private originCupPositions = new Map<string, Vec3>(); // 改用唯一ID记录
    private isProcessing = false; // 添加状态锁
    static instance: LevelAction; // 添加静态实例

    onLoad() {
        LevelAction.instance = this;
    }

    start() {
        this.generateInitialCups();
        this.registerListener();
    }

    onDestroy() {
        this.unregisterListener();
    }

    registerListener() {
        EventDispatcher.instance.on(GameEvent.EVENT_REFRESH_COLOR, this.generateOriginCups, this);
        EventDispatcher.instance.on(GameEvent.EVENT_CLICK_ORIGIN_CUP, this.handlePourOriginCup, this);
        EventDispatcher.instance.on(GameEvent.EVENT_ORIGIN_CUP_DESTROYED, (uuid: string) => {
            if (!this.originCupPositions) return
            const targetPos = this.originCupPositions.get(uuid);
            if (targetPos) {
                this.spawnNewOriginCup(targetPos);
            }
        }, this);
        EventDispatcher.instance.on(GameEvent.EVENT_COCKTAIL_CUP_DESTROYED, this.handleCupDestroyed, this);
    }

    unregisterListener() {
        EventDispatcher.instance.off(GameEvent.EVENT_REFRESH_COLOR, this.generateOriginCups, this);
        EventDispatcher.instance.off(GameEvent.EVENT_CLICK_ORIGIN_CUP, this.handlePourOriginCup, this);
        EventDispatcher.instance.off(GameEvent.EVENT_ORIGIN_CUP_DESTROYED, this.spawnNewOriginCup, this);
        EventDispatcher.instance.off(GameEvent.EVENT_COCKTAIL_CUP_DESTROYED, this.handleCupDestroyed, this);
    }

    private async generateInitialCups() {
        const instance = TakeGobletGlobalInstance.instance;
        const configs = instance.getInitialCupsConfig();

        const allCups: Node[] = [];
        for (const config of configs) {
            for (let i = 0; i < config.count; i++) {
                const prefab = await instance.loadAsyncCocktail(config.height);
                const cupNode = instantiate(prefab);
                const cup = cupNode.getComponent(CocktailCup)!;

                cup.reset();
                allCups.push(cupNode);
            }
        }

        const levelColors = LevelManager.instance.levelModel.levelColors;
        const rule = instance.cocktailCupRule();
        const [x, y] = rule;
        const colorPool = levelColors.slice(0, y);

        // 为所有杯子分配颜色，并控制颜色种类不超过y种
        allCups.forEach(cup => {
            const cupComp = cup.getComponent(CocktailCup)!;
            // 从颜色池随机选择一个颜色
            const randomColor = colorPool[Math.floor(Math.random() * colorPool.length)];
            cupComp.cupColor = randomColor;
        });

        console.log('allCups: ', allCups.length);
        // 分配初始位置
        allCups.slice(0, 2).forEach(cup => this.outArea.addCup(cup));
        allCups.slice(2).forEach(cup => this.waitArea.addCup(cup));

        // 在分配完调酒杯后添加
        this.generateOriginCups();

        // 初始化暂存区
        this.tempCups.children.forEach(tempCupNode => {
            const tempCup = tempCupNode.getComponent(TempCup)!;
            tempCup.reset(); // 重置所有暂存杯
        });
    }

    // 当调酒区杯子被消除时调用
    public async handleCupsRemoved(count: number) {
        for (let i = 0; i < count; i++) {
            const cup = this.waitArea.takeCup();
            if (cup) {
                this.outArea.addCup(cup);
            }
        }
    }

    private async generateOriginCups() {

        if (this.isProcessing) {
            tgxUITips.show('我知道你很急，但你先别急!');
            return;
        }
        const levelModel = LevelManager.instance.levelModel;
        const outCups = this.outArea.getCups() as Node[];
        const waitCups = this.waitArea.getCups() as Node[];

        const measuringcup_number = levelModel.levelConfig.measuringcup_number;
        const allCups = [...outCups, ...waitCups].slice(0, measuringcup_number);
        const colors = allCups.map(cup => {
            const comp = cup.getComponent(CocktailCup);
            return comp ? comp.cupColor : WaterColors.Blue;
        });

        this.originArea.children.forEach(originCupNode => {
            const originCup = originCupNode.getComponent(OriginCup)!;
            const waters = originCup.waters.children;

            for (let i = 0; i < originCup.cupHeight; i++) {
                const waterNode = waters[i];
                const water = waterNode.getComponent(Water);
                if (water) {
                    water.initColor(colors[Math.floor(Math.random() * colors.length)]);
                    waterNode.active = true;
                }
            }

            // 在生成初始原浆杯时记录位置
            const id = originCupNode.uuid; // 使用节点唯一ID
            this.originCupPositions.set(id, originCupNode.position.clone());
            // console.log('在生成初始原浆杯时记录id : ', id, originCupNode.position);
        });
    }

    private findTargetCupInOutArea(color: WaterColors): { node: Node, comp: CocktailCup } | null {
        const validCups = this.outArea.getCups()
            .map(node => ({
                node,
                comp: node.getComponent(CocktailCup)!
            }))
            .filter(({ comp }) =>
                comp &&
                comp.cupColor === color &&
                !comp.isFull
            );

        if (validCups.length === 0) return null;

        const sorted = validCups.sort((a, b) => (a.comp.remainingCapacity ?? 0) - (b.comp.remainingCapacity ?? 0));
        return sorted[0];
    }

    public async handlePourOriginCup(originCup: OriginCup) {
        if (this.isProcessing) {
            tgxUITips.show('我知道你很急，但你先别急!');
            return;
        }
        this.isProcessing = true;

        try {
            // 如果子节点0是底层，需要反转顺序
            const watersNode: Node[] = [];
            for (let i = originCup.waters.children.length - 1; i >= 0; i--) {
                const waterNode = originCup.waters.children[i];
                if (waterNode.active) {
                    watersNode.push(waterNode);
                }
            }

            let hasUnprocessed = false; // 标记是否有未处理的水层

            for (const waterNode of watersNode) {
                const color = waterNode.getComponent(Water)!.color;
                let targetNode: Node | null = this.findTargetCupInOutArea(color)?.node || null;
                let targetIsTemp = false;

                if (waterNode.getComponent(Water).markActive) {
                    waterNode.getComponent(Water)!.setMark(false);
                }

                // 调酒区未找到，查找暂存区
                if (!targetNode) {
                    const tempCupsComp = this.tempCups.getComponent(TempCups);
                    if (!tempCupsComp) {
                        console.error('TempCups component not found!');
                        continue;
                    }
                    const tempCup = tempCupsComp.findAvailableTempCup();
                    if (tempCup) {
                        targetNode = tempCup.node;
                        targetIsTemp = true;
                    }
                }

                if (!targetNode) {
                    hasUnprocessed = true;
                    console.log(`颜色${WaterColors[color]}未找到可用杯子`);
                    continue; // 继续尝试处理后续颜色
                }

                await this.pourAnimation(
                    originCup.node,
                    targetNode,
                    color,
                    undefined,
                    targetIsTemp
                );

                // 更新目标杯
                if (targetIsTemp) {
                    const tempCupComp = targetNode.getComponent(TempCup)!;
                    tempCupComp.fill(color);
                } else {
                    const cocktailCup = targetNode.getComponent(CocktailCup)!;
                    await cocktailCup.addLayer(color); // 等待添加水层流程完成
                }

                this.hideCurrentWaterLayer(originCup);
            }

            // 处理完所有颜色后检查剩余水层
            const remaining = originCup.waters.children.filter(n => n.active).length;
            if (hasUnprocessed || remaining > 0) {
                // console.log("游戏结束：仍有未处理的水层");
                this.isProcessing = true;
                LevelManager.instance.levelModel.isWin = false;
                tgxUIMgr.inst.showUI(UI_BattleResult);
            } else {
                // 所有水层处理完毕，销毁原浆杯
                originCup.destroyOriginCup();
                this.addWaitCupToOutArea();
            }
        } finally {
            this.isProcessing = false;
        }
    }

    //处理暂存区倒水到调酒区
    private async handlePourTempCupToOutArea() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const tempCupsComp = this.tempCups.getComponent(TempCups)!;
            const filledCups = tempCupsComp.getFilledCups();

            for (const tempCup of filledCups) {
                const originalPos = tempCup.node.position.clone();
                const colors = tempCup.getColors();
                let hasProcessed = false; // 标记是否有处理过颜色

                for (const color of colors) {
                    const targetCup = this.findTargetCupInOutArea(color);
                    if (!targetCup) {
                        console.log(`颜色${WaterColors[color]}未找到可用调酒杯`);
                        continue;
                    }

                    await this.pourAnimation(
                        tempCup.node,
                        targetCup.node,
                        color,
                        originalPos,
                        true
                    );

                    const cocktailCup = targetCup.comp;
                    await cocktailCup.addLayer(color);
                    hasProcessed = true; // 标记已处理
                }
                // 仅当有处理过颜色时才重置暂存杯
                if (hasProcessed) {
                    tempCup.reset();
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    // 添加新杯子后触发暂存区倒水
    private async addWaitCupToOutArea() {
        // 原有添加逻辑保持不变
        const waitCups = this.waitArea.cups;
        const outCups = this.outArea.getCups();
        const needAddCount = outCups.length === 0 ? 2 : 1;
        const byX = outCups.length === 0 ? 160 : 80;

        const movingCups: Node[] = [];
        for (let i = 0; i < needAddCount; i++) {
            if (waitCups.length === 0) break;
            movingCups.push(waitCups.pop()!);
        }

        const newCups: Node[] = [];
        for (const cup of movingCups) {
            const comp = cup.getComponent(CocktailCup)!;
            const prefab = await TakeGobletGlobalInstance.instance.loadAsyncCocktail(comp.cupHeight);
            const newCup = instantiate(prefab);
            const newComp = newCup.getComponent(CocktailCup)!;

            newComp.cupColor = comp.cupColor;
            newComp.reset();

            const targetX = outCups.length === 0 ?
                (newCups.length === 0 ? -120 : -40) :
                -40;
            newCup.setPosition(new Vec3(targetX, 0, 0));

            newCups.push(newCup);
            cup.destroy();
        }

        const outNodes = this.outArea.node.getChildByName('OutNodes')!;
        newCups.forEach(cup => cup.setParent(outNodes));

        // 执行统一平移
        if (this.waitArea.getCups().length > 0) {
            this.outArea.getCups().concat(this.waitArea.getCups()).forEach(cup => {
                tween(cup)
                    .by(0.3, { position: new Vec3(byX, 0, 0) }, { easing: 'sineOut' })
                    .start();
            });
        }

        // 在添加完成后处理暂存区倒水
        await this.handlePourTempCupToOutArea();

        // 胜利条件检测：当两个区域都没有杯子时触发胜利
        if (this.outArea.getCups().length === 0 && this.waitArea.cups.length === 0) {
            this.isProcessing = true;
            LevelManager.instance.levelModel.isWin = true;
            tgxUIMgr.inst.showUI(UI_BattleResult);
        }
    }

    //倒水移动动画
    private async pourAnimation(
        origin: Node,
        target: Node,
        color: WaterColors,
        originalPos?: Vec3,
        isTempCup: boolean = false
    ) {
        // 使用正确的坐标转换
        const originParent = origin.parent!;
        const targetWorldPos = target.worldPosition;
        const localPos = originParent.getComponent(UITransform)!.convertToNodeSpaceAR(targetWorldPos);

        // 调整Y轴偏移量
        if (isTempCup) {
            localPos.y += 80; // 暂存杯偏移
        } else {
            localPos.y += 150; // 调酒杯偏移
        }

        // 移动动画到目标位置
        await new Promise<void>(resolve => {
            tween(origin)
                .to(0.5, { position: localPos })
                .call(resolve)
                .start();
        });

        // 返回到暂存区初始位置
        if (isTempCup && originalPos) {
            await new Promise(resolve => {
                tween(origin)
                    .to(0.3, { position: originalPos })
                    .call(resolve)
                    .start();
            });
        }
    }

    //隐藏原浆杯当前水层
    private hideCurrentWaterLayer(originCup: OriginCup) {
        const activeWaters = originCup.waters.children.filter(n => n.active);
        if (activeWaters.length >= 0) {
            const topIndex = activeWaters.length - 1;
            activeWaters[topIndex].active = false;
        }
    }

    private async spawnNewOriginCup(targetPos: Vec3) {
        const levelModel = LevelManager.instance.levelModel;
        const measuringcup_number = levelModel.levelConfig.measuringcup_number;//获取调酒和等待区前面数量
        const colors = this.getAvailableColors(measuringcup_number);
        if (colors.length <= 0) return;

        // 创建新原浆杯
        const height = TakeGobletGlobalInstance.instance.generateOriginCupHeight();
        const prefab = await TakeGobletGlobalInstance.instance.loadAsyncOriginCup(height);
        const newCup = instantiate(prefab);

        // 设置初始位置（屏幕左侧）
        const uiTransform = this.node.getComponent(UITransform)!;
        newCup.setPosition(-uiTransform.width / 2, 0, 0);
        newCup.getComponent(OriginCup)!.cupHeight = height;
        this.originArea.addChild(newCup);
        this.setupOriginCupColors(newCup, colors);

        // 记录新杯子的初始位置
        this.originCupPositions.set(newCup.uuid, targetPos);

        // 移动动画到原位置
        tween(newCup)
            .to(0.5, { position: targetPos })
            .start();

        const markCount = this.originArea.getComponent(OriginArea)?.getTotalMarkCount();
        LevelManager.instance.levelModel.createQuestionCount = markCount;
    }

    // 获取可用颜色
    private getAvailableColors(count: number): WaterColors[] {
        const outCups = this.outArea.getCups();
        const waitCups = this.waitArea.getCups();
        const allCups = [...outCups, ...waitCups].slice(0, count);

        return allCups.map(cup => {
            const comp = cup.getComponent(CocktailCup);
            return comp ? comp.cupColor : WaterColors.Blue;
        });
    }

    // 设置原浆杯颜色
    private setupOriginCupColors(cupNode: Node, colors: WaterColors[]) {
        const originCup = cupNode.getComponent(OriginCup)!;
        const waters = originCup.waters.children;
        // console.log(`新创建原浆杯，高度: ${originCup.cupHeight}`);
        const markCount = this.originArea.getComponent(OriginArea)?.getTotalMarkCount();
        const waterCount = originCup.cupHeight;
        for (let i = 0; i < waterCount; i++) {
            const waterNode = waters[i];
            if (!waterNode) continue;

            const water = waterNode.getComponent(Water)!;
            const mark = TakeGobletGlobalInstance.instance.refreshQuestionWater(markCount);
            water.color = colors[Math.floor(Math.random() * colors.length)];
            waterNode.active = true;
            // console.log('mark: ', mark);
            water.setMark(mark);
        }
    }

    private handleCupDestroyed(destroyedCup: Node) {
        // 从outArea移除被销毁的杯子
        this.outArea.removeCup(destroyedCup);
    }
}

