export interface AvatarPreset {
  id: string;
  name: string;
  type: 'static' | 'live2d' | 'realistic';
  emoji: string;
  description: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'robot',
    name: '机器人',
    type: 'static',
    emoji: '🤖',
    description: '经典科技风格',
  },
  {
    id: 'cat',
    name: '猫咪',
    type: 'static',
    emoji: '🐱',
    description: '可爱萌系',
  },
  {
    id: 'fox',
    name: '狐狸',
    type: 'static',
    emoji: '🦊',
    description: '聪明伶俐',
  },
  {
    id: 'panda',
    name: '熊猫',
    type: 'static',
    emoji: '🐼',
    description: '国宝级可爱',
  },
  {
    id: 'rabbit',
    name: '兔子',
    type: 'static',
    emoji: '🐰',
    description: '温柔可爱',
  },
  {
    id: 'dog',
    name: '小狗',
    type: 'static',
    emoji: '🐕',
    description: '忠诚友好',
  },
  {
    id: 'owl',
    name: '猫头鹰',
    type: 'static',
    emoji: '🦉',
    description: '智慧博学',
  },
  {
    id: 'unicorn',
    name: '独角兽',
    type: 'static',
    emoji: '🦄',
    description: '奇幻魔法',
  },
  {
    id: 'alien',
    name: '外星人',
    type: 'static',
    emoji: '👽',
    description: '科幻未来',
  },
  {
    id: 'star',
    name: '星星',
    type: 'static',
    emoji: '⭐',
    description: '闪耀光芒',
  },
  {
    id: 'crystal',
    name: '水晶球',
    type: 'static',
    emoji: '🔮',
    description: '神秘占卜',
  },
  {
    id: 'brain',
    name: '大脑',
    type: 'static',
    emoji: '🧠',
    description: '智慧思考',
  },
  {
    id: 'penguin',
    name: '企鹅',
    type: 'static',
    emoji: '🐧',
    description: '极地萌物',
  },
  {
    id: 'bear',
    name: '小熊',
    type: 'static',
    emoji: '🐻',
    description: '憨厚可爱',
  },
  {
    id: 'koala',
    name: '考拉',
    type: 'static',
    emoji: '🐨',
    description: '慵懒萌物',
  },
  {
    id: 'tiger',
    name: '老虎',
    type: 'static',
    emoji: '🐯',
    description: '威风凛凛',
  },
  {
    id: 'lion',
    name: '狮子',
    type: 'static',
    emoji: '🦁',
    description: '王者风范',
  },
  {
    id: 'dolphin',
    name: '海豚',
    type: 'static',
    emoji: '🐬',
    description: '聪明友善',
  },
  {
    id: 'butterfly',
    name: '蝴蝶',
    type: 'static',
    emoji: '🦋',
    description: '优雅美丽',
  },
  {
    id: 'rocket',
    name: '火箭',
    type: 'static',
    emoji: '🚀',
    description: '探索未知',
  },
];