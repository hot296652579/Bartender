import { _decorator, CCInteger, Component, Enum, find, Node, sp, tween, UITransform, Vec3 } from 'cc';
import { CupHeight, TakeGobletGlobalInstance, WaterColors } from '../TakeGobletGlobalInstance';
import { LevelAction } from '../LevelAction';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
import { Water } from './Water';
import { OriginArea } from './OriginArea';
import { LevelManager } from '../Manager/LevelMgr';
import { tgxUITips } from 'db://assets/core_tgx/tgx';
const { ccclass, property, executeInEditMode } = _decorator;

//原浆杯状态 默认 抬起 倒水
export enum OriginCupState {
    Default,
    Up,
    PourWater
}

/** 原浆酒杯组件脚本*/
@ccclass('OriginCup')
@executeInEditMode
export class OriginCup extends Component {
    @property(sp.Skeleton)
    cupSkeleton: sp.Skeleton = null!;  //杯骨骼

    @property({ type: Enum(CupHeight), displayName: '杯高度' })
    cupHeight: CupHeight = CupHeight.Two

    @property(Node)
    waters: Node = null!;  //水节点

    @property(Node)
    marks: Node = null!;  //mark节点

    @property(Node)
    freeze: Node = null!;  //冰冻节点

    get freezeActive() {
        return this.freeze.active;
    }

    set freezeActive(value: boolean) {
        this.freeze.active = value;
    }

    start() {
        this.cupSkeleton = this.node.getChildByName('Cup')?.getComponent(sp.Skeleton)!;

        this.node.on(Node.EventType.TOUCH_END, () => {
            if (this.freezeActive) {
                tgxUITips.show('冰冻中，无法操作!');
                return;
            }
            EventDispatcher.instance.emit(GameEvent.EVENT_CLICK_ORIGIN_CUP, this);
        });
    }

    async spawnNewOriginCup(height: CupHeight, targetPos: Vec3, colors: WaterColors[]): Promise<void> {
        return new Promise((resolve) => {
            if (!this.node) return;
            const levelAction = this.node.parent?.parent?.getComponent(LevelAction)!;

            // 设置初始位置（屏幕左侧）
            const uiTransform = levelAction.node.getComponent(UITransform)!;
            this.node.setPosition(-uiTransform.width / 2, 0, 0);
            this.node.getComponent(OriginCup)!.cupHeight = height;
            levelAction.originArea?.addChild(this.node);
            // console.log(`spawnNewOriginCup 设置初始位置:${this.node.position}`);
            this.setupOriginCupColors(this.node, colors);
            this.setupFrozen();

            // 记录新杯子的初始位置
            levelAction.originCupPositions.set(this.node.uuid, targetPos);

            // 移动动画到原位置
            tween(this.node)
                .to(0.5, { position: targetPos })
                .call(() => {
                    const markCount = levelAction.originArea?.getComponent(OriginArea)?.getTotalMarkCount();
                    console.log(`mark总数:${markCount}`);
                    LevelManager.instance.levelModel.createQuestionCount = markCount;
                    resolve();
                })
                .start();
        });
    }

    // 设置原浆杯颜色
    private setupOriginCupColors(cupNode: Node, colors: WaterColors[]) {
        const levelAction = this.node.parent?.parent?.getComponent(LevelAction)!;
        const originCup = cupNode.getComponent(OriginCup)!;
        const marks = cupNode.getChildByName('Marks')!;
        const waters = originCup.waters.children;
        // console.log(`新创建原浆杯，高度: ${originCup.cupHeight}`);
        const markCount = levelAction.originArea.getComponent(OriginArea)?.getTotalMarkCount();
        const waterCount = originCup.cupHeight;
        for (let i = 0; i < waterCount; i++) {
            const waterNode = waters[i];
            if (!waterNode) continue;

            const water = waterNode.getComponent(Water)!;
            const mark = TakeGobletGlobalInstance.instance.refreshQuestionWater(markCount);
            water.color = colors[Math.floor(Math.random() * colors.length)];
            waterNode.active = true;
            console.log(`i:${i} --  marks.children[i].name:${marks.children[i].name}`);
            if (mark) {
                marks.children[i].active = true;
            }
        }
    }

    // 设置原浆冰冻
    private setupFrozen() {
        const levelAction = this.node.parent?.parent?.getComponent(LevelAction)!;
        const freezeCount = levelAction.originArea.getComponent(OriginArea)?.getFrozenCupCount();
        const freeze = TakeGobletGlobalInstance.instance.refreshFreezeWater(freezeCount);
        this.freezeActive = freeze;
    }

    //解除冰冻
    unFreeze() {
        const nextIndex = this.freeze.children.filter(n => n.active).length - 1;
        console.log(`解冻的索引:${nextIndex}`);
        const freezeNode = this.freeze.children[nextIndex];
        freezeNode.active = false;

        const freezeCount = this.freeze.children.filter(n => n.active).length;
        if (freezeCount == 0) {
            this.freezeActive = false;
        }
    }

    //播放动画根据状态
    playAnimation(state: OriginCupState, index?: number) {
        switch (state) {
            case OriginCupState.Up:
                this.playUpAnimation();
                break;
            case OriginCupState.PourWater:
                this.playPourWaterAnimation(index);
                break;
            default:
                break;
        }
    }

    playUpAnimation() {
        if (!this.cupSkeleton) return;
        this.cupSkeleton.setAnimation(0, 'pour_idle', false);

        this.waters.children.forEach(water => {
            water.getComponent(Water)?.playAnimation(OriginCupState.Up);
        });
    }

    playPourWaterAnimation(index: number) {
        if (!this.cupSkeleton) return;

        this.cupSkeleton.setAnimation(0, `pour_0${index}`, false);
        this.waters.children.forEach(water => {
            water.getComponent(Water)?.playAnimation(OriginCupState.PourWater, index);
        });
    }

    setMark(bool: boolean) {
        this.marks.active = bool;
    }

    destroyOriginCup() {
        const id = this.node.uuid;
        console.log('销毁原浆杯id : ', id);
        tween(this.node)
            .to(0.3, { scale: Vec3.ZERO })
            .call(() => {
                EventDispatcher.instance.emit(GameEvent.EVENT_ORIGIN_CUP_DESTROYED, id);
                this.node.destroy();
            })
            .start();
    }
}


