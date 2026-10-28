import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { getImageUrl } from '../utils/driveUtils';
import { sanitizeString } from '../utils/securityUtils';

const SHEET_ID = import.meta.env.VITE_SHEET_ID || '2PACX-1vTRe7S2uLO8jcpgYi-teDs6vdf7a6r6oZk-NXJTITK3z5-Ss0RukmknJCygBXOMdoWHOd7c-K7ITkWW';

const getSheetUrl = (gid) =>
    `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;

const GIDS = {
    BUILDS: '1203618170',
    DATA: '2033837238',
    WEAPONS: '27218917',
    ASSETS: '1493123867',
    ROLE_RANKING: '507369484',
    HOYOLAB: '0'
};

const CACHE_KEY = 'codetraveller_builds_cache';
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

export const useBuildsData = () => {
    const [builds, setBuilds] = useState([]);
    const [assets, setAssets] = useState({
        artifacts: {}, artifactShortNames: {}, regions: {}, stats: {},
        sourceIcons: {}, weaponTypes: {}, wallpapers: {}, weaponsMap: {},
        characters: {}, logo: '', avatar: '', logos: {}, artifactTypes: {},
        roleIcons: {}, profile: { following: 0, followers: 0, likes: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {

            // ✅ FIXED: entire function wrapped in try-catch
            // Previously JSON.parse(cached) was outside try-catch and could
            // crash silently — leaving loading=true forever with no error shown.
            try {
                // --- Cache check ---
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { builds: cachedBuilds, assets: cachedAssets, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_TIME) {
                        setBuilds(cachedBuilds);
                        setAssets(cachedAssets);
                        setLoading(false);
                        return;
                    }
                }

                // --- Fetch all sheets in parallel ---
                const [buildsRes, dataRes, weaponsRes, assetsRes, roleRes, postsRes] = await Promise.all([
                    fetch(getSheetUrl(GIDS.BUILDS)),
                    fetch(getSheetUrl(GIDS.DATA)),
                    fetch(getSheetUrl(GIDS.WEAPONS)),
                    fetch(getSheetUrl(GIDS.ASSETS)),
                    fetch(getSheetUrl(GIDS.ROLE_RANKING)),
                    fetch(getSheetUrl(GIDS.HOYOLAB))
                ]);

                if (!buildsRes.ok || !dataRes.ok || !weaponsRes.ok || !assetsRes.ok || !roleRes.ok || !postsRes.ok) {
                    throw new Error('Failed to fetch data from Google Sheets. Please check your connection.');
                }

                const parseCsv = (csv) =>
                    new Promise((resolve) =>
                        Papa.parse(csv, { header: true, skipEmptyLines: true, complete: (res) => resolve(res.data) })
                    );

                const [buildsRaw, dataRaw, weaponsRaw, assetsRaw, roleRaw] = await Promise.all([
                    buildsRes.text().then(parseCsv),
                    dataRes.text().then(parseCsv),
                    weaponsRes.text().then(parseCsv),
                    assetsRes.text().then(parseCsv),
                    roleRes.text().then(parseCsv),
                    postsRes.text().then(parseCsv) // fetched but not used here
                ]);

                // --- Helper: case-insensitive column getter ---
                const getRowVal = (row, keyOrKeys) => {
                    if (!row || typeof row !== 'object') return '';
                    const searchKeys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
                    const rowHeaders = Object.keys(row);

                    for (const k of searchKeys) {
                        const target = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const matchingHeader = rowHeaders.find(h => {
                            const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
                            return clean === target || clean.startsWith(target + '_');
                        });
                        if (matchingHeader) {
                            const val = row[matchingHeader];
                            if (val !== undefined && val !== null && String(val).trim() !== '') {
                                return String(val).trim();
                            }
                        }
                    }
                    return '';
                };

                const weaponsMap = {};
                const dataMap = {};
                const assetsMap = {
                    artifacts: {}, artifactShortNames: {}, regions: {}, stats: {},
                    sourceIcons: {}, weaponTypes: {}, wallpapers: {}, logo: '',
                    avatar: '', logos: {}, artifactTypes: {}, roleIcons: {},
                    profile: { following: 0, followers: 0, likes: 0 }
                };

                // --- 1. Process Assets sheet ---
                assetsRaw.forEach(row => {
                    // Artifacts
                    const artifactName = getRowVal(row, ['Artifact-Name', 'Artifact Name', 'ArtifactName', 'Artifact']);
                    if (artifactName) {
                        const img = getRowVal(row, ['Artifact Sets', 'Artifact Set', 'Artifact Icon', 'Icon Artifact', 'Art Icon', 'Artifact Image', 'Image Artifact']);
                        const uArtifact = getRowVal(row, ['UArtifact', 'uartifact', 'ShortName', 'Short Name']);
                        if (img) {
                            const clean = artifactName.toLowerCase().trim();
                            const direct = getImageUrl(img);
                            assetsMap.artifacts[clean] = direct;
                            if (uArtifact) {
                                assetsMap.artifacts[uArtifact.toLowerCase().trim()] = direct;
                                assetsMap.artifactShortNames[clean] = uArtifact;
                                assetsMap.artifactShortNames[clean.replace(/\s+/g, '-')] = uArtifact;
                                assetsMap.artifactShortNames[clean.replace(/['']/g, '').replace(/[^a-z0-9]/g, '')] = uArtifact;
                                const superClean = artifactName.replace(/\s*\(.*?\)/g, '').replace(/\s*\[.*?\]/g, '').toLowerCase().trim();
                                assetsMap.artifactShortNames[superClean] = uArtifact;
                            }
                            // Legacy short keys
                            if (clean.includes("gladiator's")) assetsMap.artifacts["gladiator's"] = direct;
                            if (clean.includes("wanderer's troupe")) assetsMap.artifacts["wanderer's"] = direct;
                            if (clean.includes("emblem of severed fate")) assetsMap.artifacts["emblem"] = direct;
                            if (clean.includes("gilded dreams")) assetsMap.artifacts["gilded"] = direct;
                        }
                    }

                    // Source Icons
                    const sourceName = getRowVal(row, ['Source Name', 'SourceName', 'Source', 'Obtain Name', 'ObtainName']);
                    if (sourceName) {
                        const img = getRowVal(row, ['Source Icon', 'Source-Icon', 'Source-Link', 'SourceLink', 'SourceImage']);
                        if (img) assetsMap.sourceIcons[sourceName.toLowerCase().trim()] = getImageUrl(img);
                    }

                    // Region icons
                    const regionName = getRowVal(row, ['Region Name', 'RegionName', 'Region']);
                    if (regionName) {
                        const img = getRowVal(row, ['Icon Region', 'Region Icon', 'Region-Icon', 'RegionIcon']);
                        if (img) assetsMap.regions[regionName.toLowerCase().trim()] = getImageUrl(img);
                    }

                    // Stats icons
                    const statsName = getRowVal(row, ['Stats Name', 'Stat Name', 'StatName', 'Stats']);
                    if (statsName) {
                        const img = getRowVal(row, ['Stats', 'Stat Icon', 'Stat-Icon', 'StatIcon', 'Image Stat']);
                        if (img) assetsMap.stats[statsName.toLowerCase().trim()] = getImageUrl(img);
                    }

                    // Weapon type icons
                    const weaponType = getRowVal(row, ['Weapon Type', 'WeaponType', 'Weapon-Type', 'Icon-Weapon-Type']);
                    if (weaponType) {
                        const img = getRowVal(row, ['Icon-Weapon', 'Icon Weapon', 'Weapon Icon', 'WeaponIcon']);
                        if (img) assetsMap.weaponTypes[weaponType.toLowerCase().trim()] = getImageUrl(img);
                    }

                    // Artifact Type icons
                    const artType = getRowVal(row, ['Artifact-Type', 'Artifact Type', 'ArtType']);
                    if (artType) {
                        const img = getRowVal(row, ['Artifact-Type-Link', 'Artifact Type Link', 'ArtTypeLink']);
                        if (img) assetsMap.artifactTypes[artType.toLowerCase().trim()] = getImageUrl(img);
                    }

                    // Role Icons
                    const roleName = getRowVal(row, ['Role Icon Name', 'RoleName', 'Role']);
                    if (roleName) {
                        const img = getRowVal(row, ['Role Icon Link', 'RoleIconLink', 'RoleIcon', 'Role Image']);
                        if (img) assetsMap.roleIcons[roleName.toLowerCase().trim()] = getImageUrl(img);
                    }

                    // Wallpapers
                    const wallpaperMonth = getRowVal(row, ['Wallpaper', 'Month', 'WallpaperMonth']);
                    if (wallpaperMonth) {
                        const key = wallpaperMonth.toLowerCase().trim().substring(0, 3);
                        let mobile = getRowVal(row, ['Mobile', 'Mobile Link', 'Mobile-Link', 'Phone', 'Vertical', 'Portrait']);
                        let windows = getRowVal(row, ['Windows', 'Desktop', 'Windows Link', 'Windows-Link', 'PC', 'Horizontal']);

                        // Fix for missing calendar June, July and Nov background images
                        if (key === 'jun') {
                            if (mobile && mobile.includes('Jun.webp')) mobile = mobile.replace('Jun.webp', 'June.webp');
                            if (windows && windows.includes('Jun.webp')) windows = windows.replace('Jun.webp', 'June.webp');
                        } else if (key === 'jul') {
                            if (mobile && mobile.includes('Jul.webp')) mobile = mobile.replace('Jul.webp', 'July.webp');
                            if (windows && windows.includes('Jul.webp')) windows = windows.replace('Jul.webp', 'July.webp');
                        } else if (key === 'nov') {
                            // November Cloudinary links are broken (404), fallback to working Google Drive links
                            if (mobile && mobile.includes('Nov.webp')) {
                                mobile = 'https://drive.google.com/file/d/1q5SjpiOiDtYgJqrtg1xCK45wjQ0nh4O2/view';
                            }
                            if (windows && windows.includes('Nov.webp')) {
                                windows = 'https://drive.google.com/file/d/1z1TzZrYAXr4sqWMf-rHpcdptI-xDr7mi/view';
                            }
                        }

                        if (mobile || windows) {
                            assetsMap.wallpapers[key] = {
                                mobile: getImageUrl(mobile),
                                windows: getImageUrl(windows)
                            };
                        }
                    }

                    // Avatar
                    const avatarVal = getRowVal(row, ['Avatar', 'Profile Icon', 'ProfileIcon', 'Profile-Icon', 'Profile Image', 'ProfileImage']);
                    if (avatarVal) assetsMap.avatar = getImageUrl(avatarVal);

                    // Logos
                    const rawLogoName = getRowVal(row, ['Logo name', 'LogoName', 'Logo-Name', 'Logo']);
                    const rawLogoUrl = getRowVal(row, ['Logo', 'Logo Link', 'Logo-Link', 'LogoUrl', 'Image Logo']);
                    if (rawLogoName && rawLogoUrl) {
                        const cleanName = rawLogoName.toLowerCase().trim();
                        const directUrl = getImageUrl(rawLogoUrl);
                        assetsMap.logos[cleanName] = directUrl;
                        if (['profile', 'pfp', 'banner-logo', 'logo', 'codetraveller'].includes(cleanName)) {
                            assetsMap.logo = directUrl;
                            if (!assetsMap.avatar) assetsMap.avatar = directUrl;
                        }
                    }

                    // Profile stats
                    const parseNum = (v) => parseInt(String(v || '').replace(/,/g, ''), 10) || 0;
                    const following = getRowVal(row, ['Following', 'following']);
                    const followers = getRowVal(row, ['Followers', 'followers']);
                    const likes = getRowVal(row, ['Likes', 'likes', 'TotalLikes', 'Total Likes']);
                    if (following) assetsMap.profile.following = parseNum(following);
                    if (followers) assetsMap.profile.followers = parseNum(followers);
                    if (likes) assetsMap.profile.likes = parseNum(likes);
                });

                // --- 2. Process Weapons ---
                weaponsRaw.forEach(row => {
                    const rawName = getRowVal(row, ['Weapon', 'weapon', 'Name', 'Weapon Name']);
                    if (rawName) {
                        const name = rawName.toLowerCase().trim();
                        const source = getRowVal(row, ['Source', 'source']);
                        const sourceIcon = getRowVal(row, ['Source-LInk', 'Source Link', 'SourceIcon']);
                        const weaponImg = getRowVal(row, ['Weapon image', 'weapon image', 'Image', 'weapon-image']);

                        if (source && sourceIcon) {
                            assetsMap.sourceIcons[source.toLowerCase().trim()] = getImageUrl(sourceIcon);
                        }

                        weaponsMap[name] = {
                            name: rawName,
                            image: getImageUrl(weaponImg),
                            rarity: getRowVal(row, ['Rarity', 'Stars', 'rarity']),
                            baseAtk: getRowVal(row, ['Base ATK', 'ATK', 'BaseATK']),
                            substat: getRowVal(row, ['Main-stat type', 'Main-stat', 'Substat', 'Sub stat']),
                            substatValue: getRowVal(row, ['Main-stat value', 'Value', 'Substat Value']),
                            passiveName: getRowVal(row, ['Passive', 'Ability Name', 'Passive Name']),
                            description: getRowVal(row, ['Description', 'Ability Description', 'Passive Description']),
                            type: getRowVal(row, ['Weapon type', 'Category', 'Type']),
                            howToGet: getRowVal(row, ['How to get', 'Source', 'Obtain']),
                            sourceType: source,
                            sourceIcon: sourceIcon ? getImageUrl(sourceIcon) : null
                        };
                    }
                });

                // --- 3. Character data lookup ---
                dataRaw.forEach(row => {
                    const name = getRowVal(row, ['Name', 'names', 'name']);
                    const uname = getRowVal(row, ['UName', 'uname', 'Uname']);
                    const cid = getRowVal(row, ['C.ID', 'CID', 'c.id', 'cid']);

                    if (name) {
                        const lowerName = name.toLowerCase();
                        const existing = dataMap[lowerName] || {};

                        const rawPortrait = getRowVal(row, ['Portrait', 'portrait']);
                        const rawSplash = getRowVal(row, ['Splash Art', 'SplashArt', 'Splash-Art']);
                        const rawNamecard = getRowVal(row, ['Name Cards', 'Namecard', 'namecard']);

                        const entry = {
                            ...existing,
                            Name: name,
                            UName: uname || existing.UName || name.replace(/\s+/g, '-'),
                            CID: cid || existing.CID,
                            portrait: getImageUrl(rawPortrait) || existing.portrait,
                            splashArt: getImageUrl(rawSplash) || existing.splashArt,
                            namecard: getImageUrl(rawNamecard) || existing.namecard,
                            Region: getRowVal(row, ['Region', 'region']) || existing.Region,
                            'Weapon Type': getRowVal(row, ['Weapon Type', 'weapon type', 'WeaponType']) || existing['Weapon Type'],
                            DOB: getRowVal(row, ['DOB', 'dob']) || existing.DOB
                        };

                        dataMap[lowerName] = entry;
                        if (uname) dataMap[uname.toLowerCase()] = entry;
                        if (cid) dataMap[`id:${cid}`] = entry;
                    }
                });

                // --- 4. Role Ranking ---
                const roleRankingMap = {};
                if (Array.isArray(roleRaw)) {
                    roleRaw.forEach(row => {
                        const rowValues = Object.values(row);

                        const addRank = (name, rank, type) => {
                            if (!name || name === 'Character name') return;
                            const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                            if (!roleRankingMap[key]) roleRankingMap[key] = { rank: '', roles: [] };
                            if (rank) roleRankingMap[key].rank = rank;
                            if (type && !roleRankingMap[key].roles.includes(type)) {
                                roleRankingMap[key].roles.push(type);
                            }
                        };

                        addRank(rowValues[0], rowValues[1], 'DPS');
                        addRank(rowValues[3], rowValues[4], 'Off-Field');
                        addRank(rowValues[6], rowValues[7], 'Shielder');
                        addRank(rowValues[9], rowValues[10], 'Healer');
                        addRank(rowValues[12], '', 'Buffer');

                        const rName = rowValues[16]?.trim();
                        const rIcon = rowValues[17]?.trim();
                        if (rName && rIcon && rIcon.startsWith('http')) {
                            const direct = getImageUrl(rIcon);
                            assetsMap.roleIcons[rName.toLowerCase().trim()] = direct;
                            const lowerRName = rName.toLowerCase();
                            if (lowerRName.includes('dps')) assetsMap.roleIcons['dps'] = direct;
                            if (lowerRName.includes('off_field')) assetsMap.roleIcons['off-field'] = direct;
                            if (lowerRName.includes('support')) assetsMap.roleIcons['support'] = direct;
                            if (lowerRName.includes('shielder')) assetsMap.roleIcons['tank'] = direct;
                            if (lowerRName.includes('healer')) assetsMap.roleIcons['healer'] = direct;
                        }
                    });
                }

                // --- 5. Merge Builds ---
                const processed = buildsRaw.map((row, index) => {
                    const getVal = (keys) => getRowVal(row, keys);
                    const rawName = getVal(['Name', 'name', 'Character', 'Build Name']);
                    if (!rawName) return null;

                    const lowerName = rawName.toLowerCase();
                    const buildUname = getVal(['UName', 'uname', 'Uname']);
                    const buildCid = getVal(['C.ID', 'CID', 'c.id', 'cid']);

                    let characterData =
                        (buildCid && dataMap[`id:${buildCid}`]) ||
                        (buildUname && dataMap[buildUname.toLowerCase()]) ||
                        dataMap[lowerName];

                    if (!characterData) {
                        const normalized = lowerName.replace(/[\s-]/g, '');
                        const foundKey = Object.keys(dataMap).find(k =>
                            !k.startsWith('id:') && k.replace(/[\s-]/g, '') === normalized
                        );
                        if (foundKey) characterData = dataMap[foundKey];
                    }
                    characterData = characterData || {};

                    const rawDesc = getVal([
                        'Description (All artifacts sets are alt)',
                        'Description', 'Notes', 'description'
                    ]);

                    const roleMatch = rawDesc.match(/^([A-Z][A-Z\s\/\-&]+?)(?:\s*\(ER|\n|$)/);
                    const role = roleMatch ? roleMatch[1].trim() : '';

                    const rawElement = getVal(['Vision', 'Element', 'vision', 'element']);
                    const element = rawElement.replace(/^Animo$/i, 'Anemo') || 'Anemo';

                    return {
                        id: index,
                        name: sanitizeString(rawName),
                        rarity: sanitizeString(getVal(['Rarity', 'rarity']) || '4'),
                        element,
                        weapon: sanitizeString(getVal(['Weapons', 'Weapon', 'weapon']) || ''),
                        role: sanitizeString(role),
                        description: sanitizeString(rawDesc),
                        priority: sanitizeString(getVal(['Priority', 'priority']) || ''),
                        mainStats: sanitizeString(getVal(['Main Stat', 'Main Stats', 'main stat']) || ''),
                        subStats: sanitizeString(getVal(['Sub Stat', 'Sub Stats', 'Sub', 'sub stat']) || ''),
                        talents: sanitizeString(getVal(['Talent Priority', 'Talents', 'talent priority']) || ''),
                        artifacts: sanitizeString(getVal(['Artifacts', 'Artifact Set', 'Artifact', 'artifact']) || ''),
                        teams: sanitizeString(getVal(['Teams', 'Team', 'teams']) || ''),
                        portrait: characterData.portrait || '',
                        namecard: characterData.namecard || '',
                        splashArt: characterData.splashArt || '',
                        region: sanitizeString(characterData.Region || characterData.region || 'Unknown'),
                        weaponType: sanitizeString(characterData['Weapon Type'] || characterData['weapon type'] || 'Unknown'),
                        uname: characterData.UName || buildUname || rawName.replace(/\s+/g, '-'),
                        dob: sanitizeString(characterData.DOB || characterData.dob || ''),
                        ranking: roleRankingMap[lowerName.replace(/[^a-z0-9]/g, '')]?.rank || null,
                        officialRoles: roleRankingMap[lowerName.replace(/[^a-z0-9]/g, '')]?.roles || []
                    };
                }).filter(Boolean).filter(b => b.name && b.name.trim() !== '');

                // --- Save & update state ---
                const finalAssets = { ...assetsMap, weaponsMap, characters: dataMap };
                setAssets(finalAssets);
                setBuilds(processed);

                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        builds: processed,
                        assets: finalAssets,
                        timestamp: Date.now()
                    }));
                } catch (cacheErr) {
                    // localStorage can fail if storage is full — not critical
                    console.warn('[Cache] Could not save to localStorage:', cacheErr.message);
                }

                setLoading(false);

            } catch (err) {
                console.error('[useBuildsData] Error:', err);
                // Clear corrupted cache so next reload fetches fresh
                localStorage.removeItem(CACHE_KEY);
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { builds, assets, loading, error };
};