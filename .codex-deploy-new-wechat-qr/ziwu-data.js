window.ZIWU_PERIODS = [
    { branch: '子', start: 23, end: 1, organ: '胆', meridian: '足少阳胆经', element: '木', yinYang: '阳', color: '#507f56', note: '传统理论认为胆经当令，宜安静入睡、顺应夜间休息。' },
    { branch: '丑', start: 1, end: 3, organ: '肝', meridian: '足厥阴肝经', element: '木', yinYang: '阴', color: '#3f7450', note: '传统理论认为肝经当令，此时通常应处于熟睡状态。' },
    { branch: '寅', start: 3, end: 5, organ: '肺', meridian: '手太阴肺经', element: '金', yinYang: '阴', color: '#8392a0', note: '传统理论认为肺经当令，仍以平稳睡眠、保持呼吸自然为宜。' },
    { branch: '卯', start: 5, end: 7, organ: '大肠', meridian: '手阳明大肠经', element: '金', yinYang: '阳', color: '#a7a086', note: '晨起时段，可逐渐唤醒身体并养成规律的生活节奏。' },
    { branch: '辰', start: 7, end: 9, organ: '胃', meridian: '足阳明胃经', element: '土', yinYang: '阳', color: '#bb8737', note: '传统养生常强调此时规律进食早餐，不过量也不过度节食。' },
    { branch: '巳', start: 9, end: 11, organ: '脾', meridian: '足太阴脾经', element: '土', yinYang: '阴', color: '#a97531', note: '日间活动渐盛，可专注工作学习，并保持适度活动。' },
    { branch: '午', start: 11, end: 13, organ: '心', meridian: '手少阴心经', element: '火', yinYang: '阴', color: '#b74836', note: '午间宜劳逸适度，有条件可短暂休息，避免过度疲劳。' },
    { branch: '未', start: 13, end: 15, organ: '小肠', meridian: '手太阳小肠经', element: '火', yinYang: '阳', color: '#c65c3e', note: '午后继续规律作息，饮食与活动以舒适、适量为原则。' },
    { branch: '申', start: 15, end: 17, organ: '膀胱', meridian: '足太阳膀胱经', element: '水', yinYang: '阳', color: '#376f91', note: '午后可适量活动、补充水分，具体饮水量应因人而异。' },
    { branch: '酉', start: 17, end: 19, organ: '肾', meridian: '足少阴肾经', element: '水', yinYang: '阴', color: '#345675', note: '傍晚逐渐收敛活动强度，为夜间休息建立稳定节奏。' },
    { branch: '戌', start: 19, end: 21, organ: '心包', meridian: '手厥阴心包经', element: '火', yinYang: '阴', color: '#8d4660', note: '晚间宜放松情绪，减少持续紧张与高强度刺激。' },
    { branch: '亥', start: 21, end: 23, organ: '三焦', meridian: '手少阳三焦经', element: '火', yinYang: '阳', color: '#6f557f', note: '传统养生视为准备入睡的时段，宜逐步安静身心。' }
];

window.getCurrentZiwuPeriod = function (date) {
    const hour = date.getHours() + date.getMinutes() / 60;
    return window.ZIWU_PERIODS.find((period) => {
        if (period.start > period.end) return hour >= period.start || hour < period.end;
        return hour >= period.start && hour < period.end;
    });
};

window.formatZiwuRange = function (period) {
    const pad = (value) => String(value).padStart(2, '0');
    return `${pad(period.start)}:00—${pad(period.end)}:00`;
};
