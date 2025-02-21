export class GameEvent {
    /** 通知UI实例化*/
    static readonly EVENT_UI_INITILIZE = 'EVENT_UI_INITILIZE';
    /** 游戏开始*/
    static readonly EVENT_GAME_START = 'EVENT_GAME_START';

    /** 点击原浆酒杯*/
    static readonly EVENT_CLICK_ORIGIN_CUP = 'EVENT_CLICK_ORIGIN_CUP';

    /** 刷新钉子颜色事件*/
    static readonly EVENT_REFRESH_PIN_COLORS = 'EVENT_REFRESH_PIN_COLORS';

    /** 按钮功能 颜色刷新事件*/
    static readonly EVENT_REFRESH_COLOR = 'EVENT_REFRESH_COLOR';

    /** 按钮功能 移出事件*/
    static readonly EVENT_MOVE_OUT = 'EVENT_MOVE_OUT';

    /** 按钮功能 补满事件*/
    static readonly EVENT_FILL_UP = 'EVENT_FILL_UP';

    /** 检测游戏是否结束*/
    static readonly EVENT_CHECK_GAME_OVER = 'EVENT_CHECK_GAME_OVER';

    /** 闯关成功 关卡升级*/
    static readonly EVENT_BATTLE_SUCCESS_LEVEL_UP = 'EVENT_BATTLE_SUCCESS_LEVEL_UP';

    /** 闯关失败 关卡重载*/
    static readonly EVENT_BATTLE_FAIL_LEVEL_RESET = 'EVENT_BATTLE_FAIL_LEVEL_RESET';

    /** 原浆杯销毁*/
    static readonly EVENT_ORIGIN_CUP_DESTROYED = 'EVENT_ORIGIN_CUP_DESTROYED';

    /** 调酒杯销毁*/
    static readonly EVENT_COCKTAIL_CUP_DESTROYED = 'EVENT_COCKTAIL_CUP_DESTROYED';
}