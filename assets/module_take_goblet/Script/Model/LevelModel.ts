import { JsonUtil } from "db://assets/core_tgx/base/utils/JsonUtil";
import { Tablelevels_config } from "../../../module_basic/table/Tablelevels_config";
import { GlobalConfig } from "../../../start/Config/GlobalConfig";
import { sys } from "cc";
import { WaterColors } from "../TakeGobletGlobalInstance";


export enum TYPE_GAME_STATE {
    GAME_STATE_INIT = 0, //准备阶段
    GAME_STATE_START = 1, //开始
    GAME_STATE_END = 2, //结束(倒计时结束)
    GAME_STATE_RESULT = 3, //结算
    GAME_STATE_PAUSE = 4, //暂停
}

/**关卡数据模型
 */
export class LevelModel {
    public levelConfig: Tablelevels_config;

    public levelColors: WaterColors[] = [];
    /** 当前关卡等级*/
    public level: number = 1;
    /** 创建问号水的水量*/
    public createQuestionCount: number = 0;
    /** 保存可随机的关卡*/
    public randomLevelList: number[] = [];
    /** 输赢*/
    public isWin: boolean = false;
    /** 是否结束*/
    public isEnd: boolean = false;

    /** 当前游戏状态*/
    public curGameState: TYPE_GAME_STATE = TYPE_GAME_STATE.GAME_STATE_INIT;

    constructor() {
        this.levelConfig = new Tablelevels_config();

        this.getRandomLevelList();

        const isDebug = GlobalConfig.isDebug;
        if (isDebug) {
            this.level = GlobalConfig.initilizeLevel;
        } else {
            const level = sys.localStorage.getItem('level');
            if (!level) {
                this.level = 1;
            } else {
                if (level > GlobalConfig.levelTotal) {
                    const randomLevel = this.randomLevelList[Math.floor(Math.random() * this.randomLevelList.length - 1)];
                    this.level = randomLevel;
                } else {
                    this.level = parseInt(level);
                }
            }
        };
        this.levelConfig.init(this.level);
        this.initLevelColors();
    }

    public initLevelColors() {
        const count = this.levelConfig.color; //获取关卡颜色数
        this.levelColors = [];
        const allColors = Object.values(WaterColors).filter(v => !isNaN(Number(v)) && v != WaterColors.Black) as WaterColors[];
        // Fisher-Yates 洗牌算法
        for (let i = allColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allColors[i], allColors[j]] = [allColors[j], allColors[i]];
        }
        this.levelColors.push(...allColors.slice(0, count))
    }

    /** 可随机的关卡合集*/
    getRandomLevelList() {
        const table = JsonUtil.get(Tablelevels_config.TableName);
        if (!table) {
            console.warn('Get level table is fail!');
        }
        this.randomLevelList = Object.values(table).filter(item => item['random'] == 1)
            .map(item => item['level']);

        // console.log('随机关卡列表:', this.randomLevelList);
    }

    /** 清除关卡数据*/
    clearLevel() {
        this.levelColors = [];
        this.createQuestionCount = 0;
        this.isWin = false;
        this.isEnd = false;
    }

}