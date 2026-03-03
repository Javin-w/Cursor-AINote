// 中文本地化配置
export const zhCN = {
  code: 'zh-CN',
  formatDistance: {
    lessThanXSeconds: {
      one: '不到 1 秒',
      other: '不到 {{count}} 秒'
    },
    xSeconds: {
      one: '1 秒',
      other: '{{count}} 秒'
    },
    halfAMinute: '半分钟',
    lessThanXMinutes: {
      one: '不到 1 分钟',
      other: '不到 {{count}} 分钟'
    },
    xMinutes: {
      one: '1 分钟',
      other: '{{count}} 分钟'
    },
    aboutXHours: {
      one: '大约 1 小时',
      other: '大约 {{count}} 小时'
    },
    xHours: {
      one: '1 小时',
      other: '{{count}} 小时'
    },
    xDays: {
      one: '1 天',
      other: '{{count}} 天'
    },
    aboutXWeeks: {
      one: '大约 1 周',
      other: '大约 {{count}} 周'
    },
    xWeeks: {
      one: '1 周',
      other: '{{count}} 周'
    },
    aboutXMonths: {
      one: '大约 1 个月',
      other: '大约 {{count}} 个月'
    },
    xMonths: {
      one: '1 个月',
      other: '{{count}} 个月'
    },
    aboutXYears: {
      one: '大约 1 年',
      other: '大约 {{count}} 年'
    },
    xYears: {
      one: '1 年',
      other: '{{count}} 年'
    },
    overXYears: {
      one: '超过 1 年',
      other: '超过 {{count}} 年'
    },
    almostXYears: {
      one: '将近 1 年',
      other: '将近 {{count}} 年'
    }
  },
  formatLong: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'yyyy/MM/dd',
    LL: 'yyyy年M月d日',
    LLL: 'yyyy年M月d日 HH:mm',
    LLLL: 'dddd, yyyy年M月d日 HH:mm'
  },
  formatRelative: {
    lastWeek: '[上]dddd HH:mm',
    yesterday: '[昨天] HH:mm',
    today: '[今天] HH:mm',
    tomorrow: '[明天] HH:mm',
    nextWeek: 'dddd HH:mm',
    other: 'L'
  },
  localize: {
    ordinalNumber: (dirtyNumber: any) => {
      const number = Number(dirtyNumber);
      return String(number);
    },
    era: {
      narrow: ['前', '公'],
      abbreviated: ['前', '公'],
      wide: ['公元前', '公元']
    },
    quarter: {
      narrow: ['1', '2', '3', '4'],
      abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
      wide: ['第一季度', '第二季度', '第三季度', '第四季度']
    },
    month: {
      narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      abbreviated: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      wide: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    },
    day: {
      narrow: ['日', '一', '二', '三', '四', '五', '六'],
      short: ['日', '一', '二', '三', '四', '五', '六'],
      abbreviated: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      wide: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    },
    dayPeriod: {
      narrow: {
        am: '上',
        pm: '下',
        midnight: '凌晨',
        noon: '午',
        morning: '早',
        afternoon: '下午',
        evening: '晚',
        night: '夜'
      },
      abbreviated: {
        am: '上午',
        pm: '下午',
        midnight: '凌晨',
        noon: '中午',
        morning: '早晨',
        afternoon: '下午',
        evening: '晚上',
        night: '夜间'
      },
      wide: {
        am: '上午',
        pm: '下午',
        midnight: '凌晨',
        noon: '中午',
        morning: '早晨',
        afternoon: '下午',
        evening: '晚上',
        night: '夜间'
      }
    }
  }
};

// 格式化日期
export const format = (date: Date | string, formatStr: string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // 简单的格式化实现
  const map: { [key: string]: string } = {
    'yyyy': dateObj.getFullYear().toString(),
    'MM': (dateObj.getMonth() + 1).toString().padStart(2, '0'),
    'dd': dateObj.getDate().toString().padStart(2, '0'),
    'HH': dateObj.getHours().toString().padStart(2, '0'),
    'mm': dateObj.getMinutes().toString().padStart(2, '0'),
    'ss': dateObj.getSeconds().toString().padStart(2, '0'),
    'EEEE': ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][dateObj.getDay()]
  };

  let result = formatStr;
  Object.keys(map).forEach(key => {
    result = result.replace(new RegExp(key, 'g'), map[key]);
  });

  // 处理中文格式
  result = result.replace(/年MM月dd日/g, `年${map.MM}月${map.dd}日`);
  
  return result;
};

// 相对时间格式化
export const formatRelative = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours} 小时前`;
  } else if (diffDays < 30) {
    return `${diffDays} 天前`;
  } else {
    return format(dateObj, 'yyyy年MM月dd日');
  }
};