'use server';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isYouTubeUrl = isYouTubeUrl;
exports.crawlYouTubeChannel = crawlYouTubeChannel;
exports.crawlYouTubeVideo = crawlYouTubeVideo;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const MAX_VIDEO_IDS = 50;
const PICK_COUNT = 5;
function getApiKey() {
    var _a;
    return (_a = process.env.YOUTUBE_API_KEY) !== null && _a !== void 0 ? _a : '';
}
function extractBestThumbnail(item) {
    var _a, _b, _c, _d, _e, _f, _g;
    const thumbnails = (_a = item.snippet) === null || _a === void 0 ? void 0 : _a.thumbnails;
    return (_g = (_e = (_c = (_b = thumbnails === null || thumbnails === void 0 ? void 0 : thumbnails.high) === null || _b === void 0 ? void 0 : _b.url) !== null && _c !== void 0 ? _c : (_d = thumbnails === null || thumbnails === void 0 ? void 0 : thumbnails.medium) === null || _d === void 0 ? void 0 : _d.url) !== null && _e !== void 0 ? _e : (_f = thumbnails === null || thumbnails === void 0 ? void 0 : thumbnails.default) === null || _f === void 0 ? void 0 : _f.url) !== null && _g !== void 0 ? _g : '';
}
function extractVideoIdFromUrl(url) {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        if (hostname === 'youtu.be') {
            const shortId = parsed.pathname.split('/').filter(Boolean)[0];
            return shortId || null;
        }
        if (hostname === 'youtube.com' || hostname === 'www.youtube.com' || hostname === 'm.youtube.com') {
            const watchId = parsed.searchParams.get('v');
            if (watchId) {
                return watchId;
            }
            const parts = parsed.pathname.split('/').filter(Boolean);
            if (parts[0] === 'shorts' && parts[1]) {
                return parts[1];
            }
        }
        return null;
    }
    catch {
        return null;
    }
}
async function fetchYouTubeApi(endpoint, params) {
    var _a, _b, _c;
    try {
        const query = new URLSearchParams(params);
        const response = await fetch(`${YOUTUBE_API_BASE}${endpoint}?${query.toString()}`);
        const payload = (await response.json());
        if (!response.ok || ((_a = payload.error) === null || _a === void 0 ? void 0 : _a.message)) {
            return { error: (_c = (_b = payload.error) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : `YouTube API 요청 실패 (${response.status})` };
        }
        return { data: payload };
    }
    catch (error) {
        return { error: error instanceof Error ? error.message : 'YouTube API 요청 중 오류가 발생했습니다' };
    }
}
function parseChannelHint(url) {
    try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.length === 0) {
            return null;
        }
        const first = parts[0];
        if (first.startsWith('@')) {
            return { kind: 'handle', value: first.slice(1) };
        }
        if (first === 'channel' && parts[1]) {
            return { kind: 'channelId', value: parts[1] };
        }
        if (first === 'user' && parts[1]) {
            return { kind: 'username', value: parts[1] };
        }
        if (first === 'c' && parts[1]) {
            return { kind: 'custom', value: parts[1] };
        }
        return null;
    }
    catch {
        return null;
    }
}
function asYouTubeVideos(items) {
    return items
        .map((item) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const videoId = (_c = (_a = item.id) !== null && _a !== void 0 ? _a : (_b = item.contentDetails) === null || _b === void 0 ? void 0 : _b.videoId) !== null && _c !== void 0 ? _c : (_e = (_d = item.snippet) === null || _d === void 0 ? void 0 : _d.resourceId) === null || _e === void 0 ? void 0 : _e.videoId;
        const thumbnail = extractBestThumbnail(item);
        if (!videoId || !thumbnail) {
            return null;
        }
        return {
            videoId,
            title: (_g = (_f = item.snippet) === null || _f === void 0 ? void 0 : _f.title) !== null && _g !== void 0 ? _g : '',
            thumbnail,
            viewCount: Number((_j = (_h = item.statistics) === null || _h === void 0 ? void 0 : _h.viewCount) !== null && _j !== void 0 ? _j : 0),
            url: `https://www.youtube.com/watch?v=${videoId}`,
        };
    })
        .filter((video) => video !== null);
}
function isYouTubeUrl(url) {
    try {
        const parsed = new URL(url);
        return ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'].includes(parsed.hostname);
    }
    catch {
        return false;
    }
}
async function resolveChannelId(url, apiKey) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    const hint = parseChannelHint(url);
    if ((hint === null || hint === void 0 ? void 0 : hint.kind) === 'channelId') {
        return hint.value;
    }
    if ((hint === null || hint === void 0 ? void 0 : hint.kind) === 'handle') {
        const result = await fetchYouTubeApi('/channels', {
            part: 'id',
            forHandle: hint.value,
            key: apiKey,
        });
        return (_d = (_c = (_b = (_a = result.data) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : null;
    }
    if ((hint === null || hint === void 0 ? void 0 : hint.kind) === 'username') {
        const result = await fetchYouTubeApi('/channels', {
            part: 'id',
            forUsername: hint.value,
            key: apiKey,
        });
        return (_h = (_g = (_f = (_e = result.data) === null || _e === void 0 ? void 0 : _e.items) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.id) !== null && _h !== void 0 ? _h : null;
    }
    if ((hint === null || hint === void 0 ? void 0 : hint.kind) === 'custom') {
        const customByHandle = await fetchYouTubeApi('/channels', {
            part: 'id',
            forHandle: hint.value,
            key: apiKey,
        });
        if ((_l = (_k = (_j = customByHandle.data) === null || _j === void 0 ? void 0 : _j.items) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.id) {
            return customByHandle.data.items[0].id;
        }
        const customBySearch = await fetchYouTubeApi('/search', {
            part: 'id',
            q: hint.value,
            type: 'channel',
            maxResults: '1',
            key: apiKey,
        });
        return (_r = (_q = (_p = (_o = (_m = customBySearch.data) === null || _m === void 0 ? void 0 : _m.items) === null || _o === void 0 ? void 0 : _o[0]) === null || _p === void 0 ? void 0 : _p.id) === null || _q === void 0 ? void 0 : _q.channelId) !== null && _r !== void 0 ? _r : null;
    }
    const videoId = extractVideoIdFromUrl(url);
    if (videoId) {
        const videoResult = await fetchYouTubeApi('/videos', {
            part: 'snippet',
            id: videoId,
            key: apiKey,
        });
        const channelId = (_v = (_u = (_t = (_s = videoResult.data) === null || _s === void 0 ? void 0 : _s.items) === null || _t === void 0 ? void 0 : _t[0]) === null || _u === void 0 ? void 0 : _u.snippet) === null || _v === void 0 ? void 0 : _v.channelId;
        return typeof channelId === 'string' ? channelId : null;
    }
    return null;
}
async function crawlYouTubeChannel(channelUrl) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const baseResult = {
        platform: 'youtube',
        highViewVideos: [],
        lowViewVideos: [],
    };
    if (!isYouTubeUrl(channelUrl)) {
        return { ...baseResult, error: '유효한 YouTube URL이 아닙니다' };
    }
    const apiKey = getApiKey();
    if (!apiKey) {
        return {
            ...baseResult,
            error: 'YouTube API 키가 설정되지 않았습니다. YOUTUBE_API_KEY 환경변수를 설정해주세요.',
        };
    }
    const channelId = await resolveChannelId(channelUrl, apiKey);
    if (!channelId) {
        return { ...baseResult, error: '채널을 찾을 수 없습니다' };
    }
    const channelResult = await fetchYouTubeApi('/channels', {
        part: 'snippet,contentDetails',
        id: channelId,
        key: apiKey,
    });
    if (channelResult.error) {
        return { ...baseResult, channelId, error: channelResult.error };
    }
    const channel = (_b = (_a = channelResult.data) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b[0];
    if (!channel) {
        return { ...baseResult, channelId, error: '채널을 찾을 수 없습니다' };
    }
    const uploadsPlaylistId = (_d = (_c = channel.contentDetails) === null || _c === void 0 ? void 0 : _c.relatedPlaylists) === null || _d === void 0 ? void 0 : _d.uploads;
    if (!uploadsPlaylistId) {
        return { ...baseResult, channelId, channelName: (_e = channel.snippet) === null || _e === void 0 ? void 0 : _e.title, error: '업로드 영상을 찾을 수 없습니다' };
    }
    const playlistResult = await fetchYouTubeApi('/playlistItems', {
        part: 'contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: String(MAX_VIDEO_IDS),
        key: apiKey,
    });
    if (playlistResult.error) {
        return {
            ...baseResult,
            channelId,
            channelName: (_f = channel.snippet) === null || _f === void 0 ? void 0 : _f.title,
            profileImage: extractBestThumbnail(channel),
            error: playlistResult.error,
        };
    }
    const videoIds = ((_h = (_g = playlistResult.data) === null || _g === void 0 ? void 0 : _g.items) !== null && _h !== void 0 ? _h : [])
        .map((item) => { var _a; return (_a = item.contentDetails) === null || _a === void 0 ? void 0 : _a.videoId; })
        .filter((id) => Boolean(id));
    if (videoIds.length === 0) {
        return {
            ...baseResult,
            channelId,
            channelName: (_j = channel.snippet) === null || _j === void 0 ? void 0 : _j.title,
            profileImage: extractBestThumbnail(channel),
        };
    }
    const videosResult = await fetchYouTubeApi('/videos', {
        part: 'statistics,snippet',
        id: videoIds.slice(0, MAX_VIDEO_IDS).join(','),
        key: apiKey,
    });
    if (videosResult.error) {
        return {
            ...baseResult,
            channelId,
            channelName: (_k = channel.snippet) === null || _k === void 0 ? void 0 : _k.title,
            profileImage: extractBestThumbnail(channel),
            error: videosResult.error,
        };
    }
    const videoItems = (_m = (_l = videosResult.data) === null || _l === void 0 ? void 0 : _l.items) !== null && _m !== void 0 ? _m : [];
    const sortedByViews = [...videoItems].sort((a, b) => { var _a, _b, _c, _d; return Number((_b = (_a = b.statistics) === null || _a === void 0 ? void 0 : _a.viewCount) !== null && _b !== void 0 ? _b : 0) - Number((_d = (_c = a.statistics) === null || _c === void 0 ? void 0 : _c.viewCount) !== null && _d !== void 0 ? _d : 0); });
    const highViewVideos = asYouTubeVideos(sortedByViews.slice(0, PICK_COUNT));
    const lowViewVideos = asYouTubeVideos(sortedByViews.slice(-PICK_COUNT).reverse());
    return {
        platform: 'youtube',
        channelId,
        channelName: (_o = channel.snippet) === null || _o === void 0 ? void 0 : _o.title,
        profileImage: extractBestThumbnail(channel),
        highViewVideos,
        lowViewVideos,
    };
}
async function crawlYouTubeVideo(videoUrl) {
    var _a, _b, _c;
    if (!isYouTubeUrl(videoUrl)) {
        return { error: '유효한 YouTube URL이 아닙니다' };
    }
    const apiKey = getApiKey();
    if (!apiKey) {
        return {
            error: 'YouTube API 키가 설정되지 않았습니다. YOUTUBE_API_KEY 환경변수를 설정해주세요.',
        };
    }
    const videoId = extractVideoIdFromUrl(videoUrl);
    if (!videoId) {
        return { error: '영상 ID를 추출할 수 없습니다' };
    }
    const videoResult = await fetchYouTubeApi('/videos', {
        part: 'snippet',
        id: videoId,
        key: apiKey,
    });
    if (videoResult.error) {
        return { error: videoResult.error };
    }
    const video = (_b = (_a = videoResult.data) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b[0];
    if (!video) {
        return { error: '영상을 찾을 수 없습니다' };
    }
    return {
        thumbnail: extractBestThumbnail(video),
        title: (_c = video.snippet) === null || _c === void 0 ? void 0 : _c.title,
    };
}
