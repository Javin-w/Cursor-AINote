import { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  Dice5,
  Lightbulb,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Heart,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { notesApi } from '../services/api';
import { format } from '../utils/date';

interface FunZoneProps {
  username?: string;
  onInspirationSaved?: () => void;
}

interface InspirationPrompt {
  title: string;
  prompt: string;
  tags: string[];
}

interface MoodRecord {
  lastCheckIn: string;
  moodKey: MoodKey;
  currentStreak: number;
  bestStreak: number;
}

type MoodKey = 'happy' | 'calm' | 'tired' | 'excited' | 'focused';

const MOOD_STORAGE_KEY = 'fun-zone-mood-v1';

const FORTUNE_MESSAGES = [
  '今天非常适合把一个小想法写成行动。',
  '你会在不经意间收获一个新灵感。',
  '适合先完成最难的一件事，再奖励自己。',
  '今天的你，有把混乱变清晰的超能力。',
  '一个小尝试，可能会带来大惊喜。',
  '你的耐心会在今天变成成果。',
];

const LUCKY_ACTIONS = [
  '整理 5 分钟桌面',
  '给未来的自己写一句话',
  '喝一杯水后再开始任务',
  '先做 1 个最容易完成的小任务',
  '把一个灵感立刻记下来',
  '给自己 60 秒深呼吸',
];

const MOOD_OPTIONS: Array<{ key: MoodKey; emoji: string; label: string }> = [
  { key: 'happy', emoji: '😄', label: '开心' },
  { key: 'calm', emoji: '😌', label: '平静' },
  { key: 'focused', emoji: '🧠', label: '专注' },
  { key: 'excited', emoji: '🤩', label: '兴奋' },
  { key: 'tired', emoji: '🥱', label: '有点累' },
];

const INSPIRATION_PROMPTS: InspirationPrompt[] = [
  {
    title: '反向清单',
    prompt: '写下“今天绝对不要做的 3 件事”，再反向提炼优先级。',
    tags: ['反思', '优先级'],
  },
  {
    title: '一分钟电影',
    prompt: '把你今天最想完成的一件事，想象成 1 分钟预告片。',
    tags: ['创意', '目标'],
  },
  {
    title: '未来留言',
    prompt: '给 30 天后的自己写一条 100 字留言，描述你希望的变化。',
    tags: ['成长', '计划'],
  },
  {
    title: '随机组合',
    prompt: '把“笔记 + 任务 + 游戏”组合成一个你愿意尝试的小玩法。',
    tags: ['脑暴', '玩法'],
  },
  {
    title: '微挑战',
    prompt: '设置一个 10 分钟内就能完成的小挑战，并记录结果。',
    tags: ['挑战', '执行'],
  },
];

const TIMER_OPTIONS = [60, 180, 300];

const toDateKey = (date = new Date()) => format(date, 'yyyy-MM-dd');

const formatDuration = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const createDailyFortune = (username: string | undefined, dateKey: string) => {
  const seed = `${username ?? 'guest'}-${dateKey}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const score = Math.abs(hash % 100) + 1;
  const message = FORTUNE_MESSAGES[Math.abs(hash) % FORTUNE_MESSAGES.length];
  const luckyAction = LUCKY_ACTIONS[Math.abs(hash * 7) % LUCKY_ACTIONS.length];
  return { score, message, luckyAction };
};

const getRandomPrompt = (excludeTitle?: string): InspirationPrompt => {
  if (INSPIRATION_PROMPTS.length === 1) {
    return INSPIRATION_PROMPTS[0];
  }

  let next = INSPIRATION_PROMPTS[Math.floor(Math.random() * INSPIRATION_PROMPTS.length)];
  while (excludeTitle && next.title === excludeTitle) {
    next = INSPIRATION_PROMPTS[Math.floor(Math.random() * INSPIRATION_PROMPTS.length)];
  }
  return next;
};

const FunZone = ({ username, onInspirationSaved }: FunZoneProps) => {
  const todayKey = useMemo(() => toDateKey(), []);
  const [fortune, setFortune] = useState(() => createDailyFortune(username, todayKey));
  const [prompt, setPrompt] = useState<InspirationPrompt>(() => getRandomPrompt());
  const [savingInspiration, setSavingInspiration] = useState(false);

  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [timerDuration, setTimerDuration] = useState(60);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setFortune(createDailyFortune(username, todayKey));
  }, [todayKey, username]);

  useEffect(() => {
    const raw = localStorage.getItem(MOOD_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed: MoodRecord = JSON.parse(raw);
      setCurrentStreak(parsed.currentStreak ?? 0);
      setBestStreak(parsed.bestStreak ?? 0);
      if (parsed.lastCheckIn === todayKey) {
        setSelectedMood(parsed.moodKey);
      }
    } catch {
      localStorage.removeItem(MOOD_STORAGE_KEY);
    }
  }, [todayKey]);

  useEffect(() => {
    if (!timerRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          toast.success('挑战完成！休息一下再继续冲刺吧 🎉');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [timerRunning]);

  const checkInMood = (mood: MoodKey) => {
    const raw = localStorage.getItem(MOOD_STORAGE_KEY);
    let previous: MoodRecord | null = null;
    if (raw) {
      try {
        previous = JSON.parse(raw) as MoodRecord;
      } catch {
        previous = null;
      }
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toDateKey(yesterday);

    let nextStreak = 1;
    if (previous?.lastCheckIn === todayKey) {
      nextStreak = previous.currentStreak || 1;
    } else if (previous?.lastCheckIn === yesterdayKey) {
      nextStreak = (previous.currentStreak || 0) + 1;
    }

    const nextBest = Math.max(previous?.bestStreak || 0, nextStreak);
    const record: MoodRecord = {
      lastCheckIn: todayKey,
      moodKey: mood,
      currentStreak: nextStreak,
      bestStreak: nextBest,
    };

    localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(record));
    setSelectedMood(mood);
    setCurrentStreak(nextStreak);
    setBestStreak(nextBest);

    toast.success(nextStreak > 1 ? `已连续打卡 ${nextStreak} 天` : '心情打卡成功');
  };

  const drawPrompt = () => {
    setPrompt((prev) => getRandomPrompt(prev.title));
  };

  const savePromptToNote = async () => {
    try {
      setSavingInspiration(true);
      await notesApi.createNote({
        title: `灵感盲盒：${prompt.title}`,
        content: `今日灵感题目：${prompt.prompt}\n\n我的想法：\n- \n\n下一步行动：\n- `,
        tags: ['娱乐功能', ...prompt.tags],
      });
      toast.success('灵感已保存到笔记');
      onInspirationSaved?.();
    } catch (error) {
      console.error('保存灵感失败:', error);
      toast.error('保存灵感失败，请稍后再试');
    } finally {
      setSavingInspiration(false);
    }
  };

  const toggleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(timerDuration);
    }
    setTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setSecondsLeft(timerDuration);
  };

  const chooseDuration = (seconds: number) => {
    setTimerDuration(seconds);
    setSecondsLeft(seconds);
    setTimerRunning(false);
  };

  const timerProgress = Math.min(
    100,
    Math.max(0, Math.round(((timerDuration - secondsLeft) / timerDuration) * 100))
  );

  return (
    <section className="card space-y-5">
      <div className="flex items-center space-x-2">
        <Sparkles className="text-fuchsia-600" size={20} />
        <h2 className="text-lg font-semibold text-gray-900">娱乐角</h2>
        <span className="text-sm text-gray-500">给日常管理加点乐趣</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/60 p-4 space-y-3">
          <div className="flex items-center space-x-2 text-fuchsia-700">
            <Dice5 size={18} />
            <h3 className="font-medium">今日好运签</h3>
          </div>
          <div className="flex items-end space-x-2">
            <div className="text-3xl font-bold text-fuchsia-700">{fortune.score}</div>
            <div className="text-sm text-fuchsia-600 pb-1">/100</div>
          </div>
          <p className="text-sm text-fuchsia-800">{fortune.message}</p>
          <p className="text-xs text-fuchsia-700">
            幸运动作：<span className="font-medium">{fortune.luckyAction}</span>
          </p>
        </div>

        <div className="rounded-xl border border-pink-100 bg-pink-50/60 p-4 space-y-3">
          <div className="flex items-center space-x-2 text-pink-700">
            <Heart size={18} />
            <h3 className="font-medium">心情打卡</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.key}
                type="button"
                onClick={() => checkInMood(mood.key)}
                className={`rounded-lg border px-1 py-2 text-xl transition ${
                  selectedMood === mood.key
                    ? 'border-pink-400 bg-pink-100'
                    : 'border-pink-100 bg-white hover:bg-pink-50'
                }`}
                title={mood.label}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
          <div className="text-xs text-pink-700 space-y-1">
            <p>当前连签：{currentStreak} 天</p>
            <p>历史最佳：{bestStreak} 天</p>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-4 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-700">
            <Lightbulb size={18} />
            <h3 className="font-medium">灵感盲盒</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-cyan-800">{prompt.title}</p>
            <p className="text-sm text-cyan-700 leading-relaxed">{prompt.prompt}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={drawPrompt} className="btn btn-secondary text-sm">
              换一个
            </button>
            <button
              type="button"
              onClick={savePromptToNote}
              disabled={savingInspiration}
              className="btn btn-primary text-sm disabled:opacity-60"
            >
              {savingInspiration ? '保存中...' : '存成笔记'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 text-indigo-700">
            <PlayCircle size={18} />
            <h3 className="font-medium">专注挑战计时器</h3>
          </div>
          <div className="flex items-center gap-2">
            {TIMER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => chooseDuration(option)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition ${
                  timerDuration === option
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                {option >= 60 ? `${option / 60} 分钟` : `${option} 秒`}
              </button>
            ))}
          </div>
        </div>
        <div className="text-3xl font-bold text-indigo-800 tabular-nums">{formatDuration(secondsLeft)}</div>
        <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${timerProgress}%` }} />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTimer}
            className="btn btn-primary inline-flex items-center space-x-1 text-sm"
          >
            {timerRunning ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
            <span>{timerRunning ? '暂停' : '开始'}</span>
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="btn btn-secondary inline-flex items-center space-x-1 text-sm"
          >
            <RotateCcw size={16} />
            <span>重置</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FunZone;
