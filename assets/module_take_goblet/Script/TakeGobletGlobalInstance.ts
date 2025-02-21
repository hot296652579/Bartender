import { _decorator, assetManager, Component, find, Node, Prefab } from 'cc';
import { resLoader } from '../../core_tgx/base/ResLoader';
import { ResourcePool } from './ResourcePool';
import { LevelManager } from './Manager/LevelMgr';
import { OriginArea } from './Component/OriginArea';

const { ccclass, property } = _decorator;

@ccclass('TakeGobletGlobalInstance')
export class TakeGobletGlobalInstance {
    private static _instance: TakeGobletGlobalInstance;
    public static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new TakeGobletGlobalInstance();
        return this._instance;
    }

    /** 异步加载调酒杯预设*/
    async loadAsyncCocktail(height: CupHeight): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(resLoader.gameBundleName);
            if (!bundle) {
                console.error("module_nut is null!");
                reject();
            }

            let numStr = 'Two';
            if (height == CupHeight.Three) {
                numStr = 'Three';
            } else if (height == CupHeight.Four) {
                numStr = 'Four';
            }

            resLoader.loadAsync(resLoader.gameBundleName, `Prefabs/Cup/Cocktail/Cocktail${numStr}`, Prefab).then((prefab: Prefab) => {
                resolve(prefab);
            })
        })
    }

    /** 异步加载调酒杯预设*/
    async loadAsyncOriginCup(height: CupHeight): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(resLoader.gameBundleName);
            if (!bundle) {
                console.error("module_nut is null!");
                reject();
            }

            let numStr = 'Two';
            if (height == CupHeight.Three) {
                numStr = 'Three';
            } else if (height == CupHeight.Four) {
                numStr = 'Four';
            }

            // console.log(`异步加载原浆杯预设: Original${numStr}`);
            resLoader.loadAsync(resLoader.gameBundleName, `Prefabs/Cup/Original/Original${numStr}`, Prefab).then((prefab: Prefab) => {
                resolve(prefab);
            })
        })
    }

    /** 生成原浆杯高度*/
    public generateOriginCupHeight(): CupHeight {
        const { measuringcup } = LevelManager.instance.levelModel.levelConfig;
        if (!measuringcup || measuringcup.length < 3) return CupHeight.Three;

        const totalWeight = measuringcup.reduce((a, b) => a + b, 0);
        if (totalWeight <= 0) return CupHeight.Three;

        const randomValue = Math.random() * totalWeight;
        let accumulated = 0;

        for (let i = 0; i < measuringcup.length; i++) {
            accumulated += measuringcup[i];
            if (randomValue <= accumulated) {
                // 根据索引映射到正确的CupHeight值
                switch (i) {
                    case 0: return CupHeight.Two;
                    case 1: return CupHeight.Three;
                    case 2: return CupHeight.Four;
                    default: return CupHeight.Three;
                }
            }
        }
        return CupHeight.Three;
    }

    public levels: Node = null;

    getInitialCupsConfig(): { height: CupHeight; count: number }[] {
        const { levelConfig } = LevelManager.instance.levelModel;
        const wineglass = levelConfig.wineglass;
        return [
            { height: CupHeight.Two, count: wineglass[0] },
            { height: CupHeight.Three, count: wineglass[1] },
            { height: CupHeight.Four, count: wineglass[2] }
        ];
    }

    //获取调酒杯规则
    cocktailCupRule(): number[] {
        const { wineglass_color } = LevelManager.instance.levelModel.levelConfig;
        return wineglass_color;
    }

    //问号水刷新概率
    refreshQuestionWater(markCount: number): boolean {
        const { query_probability, query_ceiling } = LevelManager.instance.levelModel.levelConfig;
        const { createQuestionCount } = LevelManager.instance.levelModel;
        // 达到上限直接返回
        if (markCount >= query_ceiling || createQuestionCount >= query_ceiling) {
            return false;
        }

        // 概率计算
        const random = Math.random() * 100;
        if (random <= query_probability) {
            LevelManager.instance.levelModel.createQuestionCount++;
        }
        return random <= query_probability;
    }
}

/**道具类型
 * @param FillUp  补满
 * @param MoveOut 移出
 * @param Disturb 打乱
*/
export enum TYPE_ITEM {
    FillUp = 1,
    MoveOut = 2,
    Refresh = 3,
}

export enum WaterColors {
    Purple = 1, // 紫
    Magenta = 2, // 紫红
    Pink = 3, // 粉
    Red = 4, // 红
    Yellow = 5, // 黄
    Green = 6, // 绿
    Cyan = 7, // 青
    Blue = 8, // 蓝
    DarkBlue = 9, // 深蓝
}

// 定义对应的十六进制颜色值
export const WaterColorHex: Record<WaterColors, string> = {
    [WaterColors.Blue]: "#317EFE",
    [WaterColors.Green]: "#4CF02F",
    [WaterColors.Red]: "#FF3939",
    [WaterColors.Cyan]: "#37F5FD",
    [WaterColors.Yellow]: "#FEF344",
    [WaterColors.Pink]: "#FD9FD2",
    [WaterColors.Purple]: "#D62F9C",
    [WaterColors.Magenta]: "#EE60FE",
    [WaterColors.DarkBlue]: "#3052A1",
};

export const WaterColorLog: Record<WaterColors, string> = {
    [WaterColors.Blue]: "蓝色",
    [WaterColors.Green]: "绿色",
    [WaterColors.Red]: "红色",
    [WaterColors.Cyan]: "青色",
    [WaterColors.Yellow]: "黄色",
    [WaterColors.Pink]: "粉色",
    [WaterColors.Purple]: "紫色",
    [WaterColors.Magenta]: '紫红色',
    [WaterColors.DarkBlue]: '深蓝色'
};

/**杯子高度*/
export enum CupHeight {
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
}



