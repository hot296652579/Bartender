import { _decorator, Color, Component, Enum, Node, Sprite, tween, Vec3, UITransform, view } from 'cc';
import { CupHeight, WaterColorHex, WaterColors } from '../TakeGobletGlobalInstance';
import { Water } from './Water';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
import { OutArea } from './OutArea';
import { GameUtil } from '../GameUtil';
const { ccclass, property, executeInEditMode } = _decorator;

/** 调酒杯组件脚本*/
@ccclass('CocktailCup')
@executeInEditMode
export class CocktailCup extends Component {

    @property(Sprite)
    sprite: Sprite = null!

    @property({ type: Enum(CupHeight), displayName: '杯高度' })
    cupHeight: CupHeight = CupHeight.Two

    @property({ type: Enum(WaterColors) })
    private _cupColor: WaterColors = WaterColors.Blue

    @property({ type: Enum(WaterColors) })
    get cupColor() {
        return this._cupColor
    }
    set cupColor(value) {
        this._cupColor = value
        this.changeColor()
    }

    @property(Node)
    waters: Node = null!;  //水节点

    currentLayers: number = 0;

    onLoad() {
        // 初始化时隐藏所有水层
        this.waters.children.forEach(water => water.active = false);
    }

    changeColor() {
        if (!this.sprite) return
        this.sprite.color = new Color(WaterColorHex[this._cupColor])
    }

    // 添加水层
    async addLayer(color: WaterColors) {
        this.currentLayers++;
        const nextIndex = this.waters.children.filter(n => n.active).length;
        const waterNode = this.waters.children[nextIndex];
        if (waterNode) {
            const water = waterNode.getComponent(Water)!;
            water.color = color;
            waterNode.active = true;

            // 添加后检查是否满杯
            await this.checkAndDestroy(); // 等待销毁流程完成
        }
    }

    //补满水
    public async fillUp() {
        const currentActive = this.waters.children.filter(n => n.active).length;
        const layersToAdd = this.cupHeight - currentActive;

        for (let i = 0; i < layersToAdd; i++) {
            const waterIndex = currentActive + i;
            const waterNode = this.waters.children[waterIndex];
            const water = waterNode.getComponent(Water)!;

            water.color = this.cupColor;
            waterNode.active = true;
            waterNode.scale = Vec3.ZERO;

            await new Promise<void>(resolve => {
                tween(waterNode)
                    .to(0.5 / layersToAdd, { scale: Vec3.ONE }, { easing: 'sineOut' })
                    .call(() => resolve())
                    .start();
            });
        }

        // 补满后执行移动销毁动画
        const uiTransform = this.node.getComponent(UITransform)!;
        const screenWidth = view.getVisibleSize().width;
        const targetX = screenWidth / 2 + uiTransform.width * 1.5;

        await new Promise<void>(resolve => {
            tween(this.node)
                .to(0.5, { position: new Vec3(targetX, 0, 0) }, { easing: 'sineIn' })
                .call(() => {
                    this.node.destroy();
                    resolve();
                })
                .start();
        });
    }

    // 清空水层（消除时调用）
    reset() {
        this.waters.children.forEach(water => water.active = false);
        this.currentLayers = 0;
    }

    get isFull(): boolean {
        return this.waters.children.every(node => node.active);
    }

    private async checkAndDestroy() {
        if (this.isFull) {
            await new Promise<void>(resolve => {
                tween(this.node)
                    .to(0.3, { scale: Vec3.ZERO })
                    .call(async () => {
                        const outArea = this.node.parent?.parent?.getComponent(OutArea);
                        if (outArea) {
                            this.node.removeFromParent(); // 先从父节点移除
                            this.node.destroy();
                            await outArea.arrangeCups();   // 等待排列完成
                        }
                        resolve();
                    })
                    .start();
            });
        }
    }

    public get currentColor(): WaterColors {
        return this.cupColor;
    }

    public get remainingCapacity(): number {
        return this.cupHeight - this.waters.children.filter(n => n.active).length;
    }
}


