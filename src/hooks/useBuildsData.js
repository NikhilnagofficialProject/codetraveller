import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { toDirectDriveLink } from '../utils/driveUtils';

const SHEET_ID = '2PACX-1vTRe7S2uLO8jcpgYi-teDs6vdf7a6r6oZk-NXJTITK3z5-Ss0RukmknJCygBXOMdoWHOd7c-K7ITkWW';

const getSheetUrl = (gid) => `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;

const GIDS = {
    BUILDS: '1203618170',
    DATA: '2033837238',
    WEAPONS: '27218917',
    ASSETS: '1493123867'
};

export const useBuildsData = () => {
    const [builds, setBuilds] = useState([]);
    const [assets, setAssets] = useState({ artifacts: {}, weapons: {}, regions: {}, stats: {}, weaponTypes: {}, wallpapers: {}, weaponsMap: {}, characters: {}, logo: '', avatar: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [buildsRes, dataRes, weaponsRes, assetsRes] = await Promise.all([
                    fetch(getSheetUrl(GIDS.BUILDS)),
                    fetch(getSheetUrl(GIDS.DATA)),
                    fetch(getSheetUrl(GIDS.WEAPONS)),
                    fetch(getSheetUrl(GIDS.ASSETS))
                ]);

                if (!buildsRes.ok || !dataRes.ok || !weaponsRes.ok || !assetsRes.ok) {
                    throw new Error('Failed to fetch data from Google Sheets. Please check your connection.');
                }

                const parseCsv = (csv) => {
                    return new Promise((resolve) => {
                        Papa.parse(csv, { header: true, skipEmptyLines: true, complete: (res) => resolve(res.data) });
                    });
                };

                const [buildsRaw, dataRaw, weaponsRaw, assetsRaw] = await Promise.all([
                    buildsRes.text().then(parseCsv),
                    dataRes.text().then(parseCsv),
                    weaponsRes.text().then(parseCsv),
                    assetsRes.text().then(parseCsv)
                ]);

                // Helper to get non-empty value from row, supporting case-insensitive keys and PapaParse suffixes
                const getRowVal = (row, keyOrKeys) => {
                    if (!row || typeof row !== 'object') return '';
                    const searchKeys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
                    const rowHeaders = Object.keys(row);
                    
                    for (const k of searchKeys) {
                        const target = k.toLowerCase().replace(/[^a-z0-9]/g, ''); // Super aggressive clean
                        
                        // Find any header that matches the target after cleaning
                        const matchingHeader = rowHeaders.find(h => {
                            const cleanedHeader = h.toLowerCase().replace(/[^a-z0-9]/g, '');
                            return cleanedHeader === target || cleanedHeader.startsWith(target + '_');
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

                // Debug: log headers to help identify column names
                if (dataRaw.length > 0) console.log('[Data] Headers:', Object.keys(dataRaw[0]));
                if (buildsRaw.length > 0) console.log('[Builds] Headers:', Object.keys(buildsRaw[0]));
                if (weaponsRaw.length > 0) console.log('[Weapons] Headers:', Object.keys(weaponsRaw[0]));
                if (assetsRaw.length > 0) console.log('[Assets] Headers:', Object.keys(assetsRaw[0]));

                const weaponsMap = {};
                const dataMap = {};
                const assetsMap = {
                    artifacts: {},
                    artifactShortNames: {},
                    regions: {},
                    stats: {},
                    sourceIcons: {},
                    weaponTypes: {},
                    wallpapers: {},
                    logo: '',
                    avatar: '',
                    logos: {},
                    artifactTypes: {},
                    profile: { following: 0, followers: 0, likes: 0 }
                };


                assetsRaw.forEach(row => {
                    // Artifacts - ensure we catch all variations
                    const artifactName = getRowVal(row, ['Artifact-Name', 'Artifact Name', 'ArtifactName', 'Artifact']);
                    if (artifactName && !artifactName.includes('drive.google.com')) {
                        const img = getRowVal(row, ['Artifact Sets', 'Artifact Set', 'Artifact Icon', 'Icon Artifact', 'Art Icon', 'Artifact Image', 'Image Artifact']);
                        const uArtifact = getRowVal(row, ['UArtifact', 'uartifact', 'ShortName', 'Short Name']);
                        if (img) {
                            const direct = toDirectDriveLink(img);
                            const clean = artifactName.toLowerCase().trim();
                            assetsMap.artifacts[clean] = direct;
                            if (uArtifact) {
                                assetsMap.artifacts[uArtifact.toLowerCase().trim()] = direct;
                                assetsMap.artifactShortNames[clean] = uArtifact;
                                assetsMap.artifactShortNames[clean.replace(/\s+/g, '-')] = uArtifact;
                                assetsMap.artifactShortNames[clean.replace(/['’]s/g, '').replace(/[^a-z0-9]/g, '')] = uArtifact;
                                const superClean = artifactName.replace(/\s*\(.*?\)/g, '').replace(/\s*\[.*?\]/g, '').toLowerCase().trim();
                                assetsMap.artifactShortNames[superClean] = uArtifact;
                            }
                            if (clean.includes("gladiator's")) assetsMap.artifacts["gladiator's"] = direct;
                            if (clean.includes("wanderer's troupe")) assetsMap.artifacts["wanderer's"] = direct;
                            if (clean.includes("emblem of severed fate")) assetsMap.artifacts["emblem"] = direct;
                            if (clean.includes("gilded dreams")) assetsMap.artifacts["gilded"] = direct;
                            if (clean.includes("heart of depth")) assetsMap.artifacts["hydro set"] = direct;
                            if (clean.includes("viridescent venerer")) assetsMap.artifacts["anemo set"] = direct;
                        }
                    }

                    // Source Icons (Master List from Assets tab)
                    const sourceName = getRowVal(row, ['Source Name', 'SourceName', 'Source', 'Obtain Name', 'ObtainName']);
                    if (sourceName) {
                        const img = getRowVal(row, ['Source Icon', 'Source-Icon', 'Source-Link', 'SourceLink', 'SourceImage']);
                        if (img) assetsMap.sourceIcons[sourceName.toLowerCase().trim()] = toDirectDriveLink(img);
                    }

                    // Region icons
                    const regionName = getRowVal(row, ['Region Name', 'RegionName', 'Region']);
                    if (regionName) {
                        const img = getRowVal(row, ['Icon Region', 'Region Icon', 'Region-Icon', 'RegionIcon']);
                        if (img) assetsMap.regions[regionName.toLowerCase().trim()] = toDirectDriveLink(img);
                    }

                    // Stats icons
                    const statsName = getRowVal(row, ['Stats Name', 'Stat Name', 'StatName', 'Stats']);
                    if (statsName) {
                        const img = getRowVal(row, ['Stats', 'Stat Icon', 'Stat-Icon', 'StatIcon', 'Image Stat']);
                        if (img) assetsMap.stats[statsName.toLowerCase().trim()] = toDirectDriveLink(img);
                    }

                    // Weapon type icons
                    const weaponType = getRowVal(row, ['Weapon Type', 'WeaponType', 'Weapon-Type', 'Icon-Weapon-Type']);
                    if (weaponType) {
                        const img = getRowVal(row, ['Icon-Weapon', 'Icon Weapon', 'Weapon Icon', 'WeaponIcon']);
                        if (img) assetsMap.weaponTypes[weaponType.toLowerCase().trim()] = toDirectDriveLink(img);
                    }

                    // Artifact Type icons (Sands/Goblet/Circlet)
                    const artType = getRowVal(row, ['Artifact-Type', 'Artifact Type', 'ArtType']);
                    if (artType) {
                        const img = getRowVal(row, ['Artifact-Type-Link', 'Artifact Type Link', 'ArtTypeLink']);
                        if (img) assetsMap.artifactTypes[artType.toLowerCase().trim()] = toDirectDriveLink(img);
                    }

                    // Wallpapers 
                    const wallpaperMonth = getRowVal(row, ['Wallpaper', 'Month', 'WallpaperMonth']);
                    if (wallpaperMonth) {
                        const key = wallpaperMonth.toLowerCase().trim().substring(0, 3);
                        const mobile = getRowVal(row, ['Mobile', 'Mobile Link', 'Mobile-Link']);
                        const windows = getRowVal(row, ['Windows', 'Desktop', 'Windows Link', 'Windows-Link']);
                        if (mobile || windows) {
                            assetsMap.wallpapers[key] = {
                                mobile: toDirectDriveLink(mobile),
                                windows: toDirectDriveLink(windows)
                            };
                        }
                    }

                    // Avatar and Profile Detection
                    const avatarVal = getRowVal(row, ['Avatar', 'Profile Icon', 'ProfileIcon', 'Profile-Icon', 'Profile Image', 'ProfileImage']);
                    if (avatarVal) {
                        assetsMap.avatar = toDirectDriveLink(avatarVal);
                    }

                    // Named Logos
                    const rawLogoName = getRowVal(row, ['Logo name', 'LogoName', 'Logo-Name', 'Logo']);
                    const rawLogoUrl = getRowVal(row, ['Logo', 'Logo Link', 'Logo-Link', 'LogoUrl', 'Image Logo']);
                    if (rawLogoName && rawLogoUrl) {
                        const cleanName = rawLogoName.toLowerCase().trim();
                        const directUrl = toDirectDriveLink(rawLogoUrl);
                        assetsMap.logos[cleanName] = directUrl;
                        if (['profile', 'pfp', 'banner-logo', 'logo'].includes(cleanName)) {
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


                // 2. Process Weapons — Capture all rich data (ATK, Substat, Description, Rarity, How to get)
                weaponsRaw.forEach(row => {
                    const rawName = getRowVal(row, ['Weapon', 'weapon', 'Name', 'Weapon Name']);
                    if (rawName) {
                        const name = rawName.toLowerCase().trim();
                        const source = getRowVal(row, ['Source', 'source']);
                        const sourceIcon = getRowVal(row, ['Source-LInk', 'Source Link', 'SourceIcon']);
                        
                        if (source && sourceIcon) {
                            assetsMap.sourceIcons[source.toLowerCase().trim()] = toDirectDriveLink(sourceIcon);
                        }

                        weaponsMap[name] = {
                            name: rawName,
                            image: toDirectDriveLink(getRowVal(row, ['Weapon image', 'weapon image', 'Image', 'weapon-image'])),
                            rarity: getRowVal(row, ['Rarity', 'Stars', 'rarity']),
                            baseAtk: getRowVal(row, ['Base ATK', 'ATK', 'BaseATK']),
                            substat: getRowVal(row, ['Main-stat type', 'Main-stat', 'Substat', 'Sub stat']),
                            substatValue: getRowVal(row, ['Main-stat value', 'Value', 'Substat Value']),
                            passiveName: getRowVal(row, ['Passive', 'Ability Name', 'Passive Name']),
                            description: getRowVal(row, ['Description', 'Ability Description', 'Passive Description']),
                            type: getRowVal(row, ['Weapon type', 'Category', 'Type']),
                            howToGet: getRowVal(row, ['How to get', 'Source', 'Obtain']),
                            sourceType: source,
                            sourceIcon: sourceIcon ? toDirectDriveLink(sourceIcon) : null
                        };
                    }
                });

                // 3. Build character data lookup from Genshin Data tab
                // Headers: C.ID | UName | Name | Name Cards | Portrait
                dataRaw.forEach(row => {
                    const name = getRowVal(row, ['Name', 'names', 'name']);
                    const uname = getRowVal(row, ['UName', 'uname', 'Uname']);
                    const cid = getRowVal(row, ['C.ID', 'CID', 'c.id', 'cid']);

                    if (name) {
                        const lowerName = name.toLowerCase();
                        const existing = dataMap[lowerName] || {};
                        
                        // Merge entries so sparse rows don't overwrite filled data
                        const entry = {
                            ...existing,
                            Name: name,
                            UName: uname || existing.UName || name.replace(/\s+/g, '-'),
                            CID: cid || existing.CID,
                            portrait: toDirectDriveLink(getRowVal(row, ['Portrait', 'portrait'])) || existing.portrait,
                            splashArt: toDirectDriveLink(getRowVal(row, ['Splash Art', 'SplashArt', 'Splash-Art'])) || existing.splashArt,
                            namecard: toDirectDriveLink(getRowVal(row, ['Name Cards', 'Namecard', 'namecard'])) || existing.namecard,
                            Region: getRowVal(row, ['Region', 'region']) || existing.Region,
                            'Weapon Type': getRowVal(row, ['Weapon Type', 'weapon type', 'WeaponType']) || existing['Weapon Type'],
                            DOB: getRowVal(row, ['DOB', 'dob']) || existing.DOB
                        };

                        dataMap[lowerName] = entry;
                        if (uname) dataMap[uname.toLowerCase()] = entry;
                        if (cid) dataMap[`id:${cid}`] = entry;
                    }
                });

                // Pre-cache Lumine for Traveler portrait
                const lumineData = dataMap['lumine'] || dataMap['lumine (traveler)'] || null;

                // 4. Merge Builds with Data
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
                        'Description',
                        'Notes',
                        'description'
                    ]);

                    const roleMatch = rawDesc.match(/^([A-Z][A-Z\s\/\-&]+?)(?:\s*\(ER|\n|$)/);
                    const role = roleMatch ? roleMatch[1].trim() : '';

                    const rawElement = getVal(['Vision', 'Element', 'vision', 'element']);
                    const element = rawElement.replace(/^Animo$/i, 'Anemo') || 'Anemo';

                    return {
                        id: index,
                        name: rawName,
                        rarity: getVal(['Rarity', 'rarity']) || '4',
                        element,
                        weapon: getVal(['Weapons', 'Weapon', 'weapon']) || '',
                        role,
                        description: rawDesc,
                        priority: getVal(['Priority', 'priority']) || '',
                        mainStats: getVal(['Main Stat', 'Main Stats', 'main stat']) || '',
                        subStats: getVal(['Sub Stat', 'Sub Stats', 'Sub', 'sub stat']) || '',
                        talents: getVal(['Talent Priority', 'Talents', 'talent priority']) || '',
                        artifacts: getVal(['Artifacts', 'Artifact Set', 'Artifact', 'artifact']) || '',
                        teams: getVal(['Teams', 'Team', 'teams']) || '',
                        portrait: characterData.portrait || '',
                        namecard: characterData.namecard || '',
                        splashArt: characterData.splashArt || '',
                        region: characterData.Region || characterData.region || 'Unknown',
                        weaponType: characterData['Weapon Type'] || characterData['weapon type'] || 'Unknown',
                        uname: characterData.UName || buildUname || rawName.replace(/\s+/g, '-'),
                        dob: characterData.DOB || characterData.dob || ''
                    };
                }).filter(Boolean).filter(b => b.name && b.name.trim() !== '');


                setAssets({ ...assetsMap, weaponsMap, characters: dataMap });
                setBuilds(processed);
                setLoading(false);

            } catch (err) {
                console.error('Data Fetch Error:', err);
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { builds, assets, loading, error };
};
