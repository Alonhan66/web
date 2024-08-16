import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../../context/AppContext';
import CustomInput from './CustomInput';
import { formattingPoiType, getCatPoiIconName, getSearchResultIcon } from '../../../manager/PoiManager';
import SearchResultItem from './SearchResultItem';
import { MenuButton } from './MenuButton';
import { Box } from '@mui/material';
import { SEARCH_ICON_MAP_OBJ, SEARCH_ICON_MAP_OBJ_URL, SEARCH_TYPE_CATEGORY } from '../../../map/layers/SearchLayer';
import Loading from '../../errors/Loading';
import { useGeoLocation } from '../../../util/hooks/useGeoLocation';
import { LOCATION_UNAVAILABLE } from '../../../manager/FavoritesManager';
import { getCenterMapLoc } from '../../../manager/MapManager';
import { getDistance } from '../../../util/Utils';
import EmptySearch from '../../errors/EmptySearch';

export const SEARCH_RESULT_TYPE_POI = 'POI';
export const SEARCH_RESULT_TYPE_POI_CATEGORY = 'POI_TYPE';

export function searchByCategory(value, ctx) {
    const preparedValue = {
        query: formattingPoiType(value.query),
        type: value.type,
    };
    ctx.setSearchQuery({
        search: preparedValue,
        type: SEARCH_TYPE_CATEGORY,
    });
}

export default function SearchResults({ value, setOpenSearchResults, setIsMainSearchScreen, setSearchValue }) {
    const ctx = useContext(AppContext);

    const [result, setResult] = useState(null);
    const hash = window.location.hash;
    const [locReady, setLocReady] = useState(false);
    const currentLoc = useGeoLocation(ctx);

    useEffect(() => {
        if (value?.query) {
            document.title = value.query;
        }
    }, [value?.query]);

    useEffect(() => {
        if (!currentLoc) return;
        const loc = getLoc();

        const features = ctx.searchResult?.features;
        if (!features || features.length === 0) {
            ctx.setProcessingSearch(false);
            setResult(null);
            return;
        }

        if (loc) {
            const arrWithDist = features.map((f) => {
                const lat = f?.geometry?.coordinates[1];
                const lon = f?.geometry?.coordinates[0];
                if (!lat || !lon) return f;
                return {
                    ...f,
                    locDist: lon === 0 && lat === 0 ? null : getDistance(loc.lat, loc.lng, lat, lon),
                };
            });

            if (arrWithDist) {
                if (!features[0].icon) {
                    calculateIcons(arrWithDist, ctx).then(() => {
                        ctx.setProcessingSearch(false);
                        setResult({ features: arrWithDist });
                    });
                } else {
                    ctx.setProcessingSearch(false);
                    setResult({ features: arrWithDist });
                }
            } else {
                setResult(null);
                ctx.setProcessingSearch(false);
            }
        }
    }, [currentLoc, ctx.searchResult]);

    useEffect(() => {
        if (locReady) {
            if (value) {
                ctx.setProcessingSearch(true);
                if (value.type === SEARCH_TYPE_CATEGORY) {
                    searchByCategory(value, ctx);
                } else {
                    searchByWord(value);
                }
            }
        }
    }, [locReady, value]);

    function getLoc() {
        let loc = null;
        if (currentLoc && currentLoc !== LOCATION_UNAVAILABLE) {
            loc = currentLoc;
            setLocReady(true);
        } else if (currentLoc && currentLoc === LOCATION_UNAVAILABLE) {
            loc = getCenterMapLoc(hash);
            setLocReady(true);
        }
        return loc;
    }

    useEffect(() => {
        // hide explore layers
        ctx.setSearchSettings({ ...ctx.searchSettings, showOnMainSearch: false });
    }, []);

    useEffect(() => {
        if (!ctx.searchResult) {
            setResult(null);
        }
    }, [ctx.searchResult]);

    function searchByWord(value) {
        let hash = window.location.hash;
        if (!hash) {
            alert('Please zoom in closer');
            return;
        }
        let arr = hash.split('/');
        if (parseInt(arr[0].substring(1)) < 7) {
            alert('Please zoom in closer');
            return;
        }

        const loc = getLoc();

        ctx.setSearchQuery({
            search: value,
            latlng: { lat: loc.lat, lng: loc.lng },
        });
    }

    function backToMainSearch() {
        setOpenSearchResults(false);
        setIsMainSearchScreen(true);
        ctx.setSearchResult(null);
        ctx.setSearchQuery(null);
    }

    const calculateIcons = async (features, ctx) => {
        const promises = features?.map(async (f) => {
            const props = f.properties;
            const type = props['web_type'];
            if (type === SEARCH_RESULT_TYPE_POI || type === SEARCH_RESULT_TYPE_POI_CATEGORY) {
                const iconName = getCatPoiIconName(props);
                f.icon = await getSearchResultIcon({ result: iconName, ctx });
            } else {
                f.icon = await getSearchResultIcon({
                    result: SEARCH_ICON_MAP_OBJ,
                    ctx,
                    iconUrl: SEARCH_ICON_MAP_OBJ_URL,
                });
            }
        });
        await Promise.all(promises);
    };

    return (
        <>
            <CustomInput
                menuButton={<MenuButton needBackButton={true} backToPrevScreen={backToMainSearch} />}
                setSearchValue={setSearchValue}
                defaultSearchValue={value?.query}
            />
            {ctx.processingSearch && <Loading />}
            {!ctx.processingSearch && (
                <Box sx={{ overflowY: 'auto' }}>
                    {result?.features.map((item, index) => (
                        <SearchResultItem key={index} item={item} index={index} setSearchValue={setSearchValue} />
                    ))}
                </Box>
            )}
            {!result && !ctx.processingSearch && <EmptySearch />}
        </>
    );
}
